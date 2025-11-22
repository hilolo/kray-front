import { Injectable } from '@angular/core';
import htmlToPdfMake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfFontsService } from './pdf-fonts.service';

// Set up pdfMake with fonts
(pdfMake as any).vfs = pdfFonts;

// Configure fonts - Arial will be added via PdfFontsService if available
// Fallback to Roboto if Arial fonts are not provided
(pdfMake as any).fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

export interface PdfGenerationOptions {
  textSize?: 'normal' | 'large' | 'extralarge';
  displayLogo?: boolean;
  logoBase64?: string;
  displayCache?: boolean;
  cacheBase64?: string;
  placeholderData?: Record<string, any>;
  baseFontSize?: number;
  pageSize?: string | [number, number];
  pageMargins?: [number, number, number, number];
}

export interface PdfGenerationResult {
  dataUrl: string;
  pdfMakeJson: string;
  docDefinition: any;
}

@Injectable({
  providedIn: 'root'
})
export class PdfGenerationService {
  private readonly pdfFontsService = PdfFontsService;

  /**
   * Removes line-height from all style attributes in HTML content
   */
  removeLineHeightFromHtml(html: string): string {
    if (!html) return html;
    
    // Remove line-height from style attributes (handles both double and single quotes)
    const result = html.replace(/style\s*=\s*(["'])([^"']*)\1/gi, (match, quote, styleContent) => {
      // Remove line-height property from style content (handles various formats)
      // Pattern matches: line-height: followed by any value (number, percentage, etc.) and optional semicolon
      let cleanedStyle = styleContent
        .replace(/line-height\s*:\s*[^;]+;?/gi, '') // Remove line-height: value; or line-height: value
        .replace(/;\s*;/g, ';') // Remove double semicolons
        .replace(/^\s*;\s*|\s*;\s*$/g, '') // Remove leading/trailing semicolons
        .trim();
      
      // If style is empty after cleaning, remove the style attribute entirely
      if (!cleanedStyle) {
        return '';
      }
      
      return `style=${quote}${cleanedStyle}${quote}`;
    });
    
    return result;
  }

  /**
   * Recursively processes PDFMake content to apply text size multiplier to all font sizes
   */
  applyTextSizeMultiplier(content: any, multiplier: number): any {
    if (!content) return content;

    // Handle arrays
    if (Array.isArray(content)) {
      return content.map(item => this.applyTextSizeMultiplier(item, multiplier));
    }

    // Handle objects
    if (typeof content === 'object') {
      const processed: any = { ...content };

      // Apply multiplier to fontSize if it exists
      if (typeof processed.fontSize === 'number') {
        processed.fontSize = Math.round(processed.fontSize * multiplier * 100) / 100;
      }

      // Recursively process nested properties
      if (processed.text && Array.isArray(processed.text)) {
        processed.text = this.applyTextSizeMultiplier(processed.text, multiplier);
      }
      if (processed.stack && Array.isArray(processed.stack)) {
        processed.stack = this.applyTextSizeMultiplier(processed.stack, multiplier);
      }
      if (processed.columns && Array.isArray(processed.columns)) {
        processed.columns = this.applyTextSizeMultiplier(processed.columns, multiplier);
      }
      if (processed.table && processed.table.body && Array.isArray(processed.table.body)) {
        processed.table.body = this.applyTextSizeMultiplier(processed.table.body, multiplier);
      }
      if (processed.ul && Array.isArray(processed.ul)) {
        processed.ul = this.applyTextSizeMultiplier(processed.ul, multiplier);
      }
      if (processed.ol && Array.isArray(processed.ol)) {
        processed.ol = this.applyTextSizeMultiplier(processed.ol, multiplier);
      }

      return processed;
    }

    return content;
  }

  /**
   * Recursively removes lineHeight from all elements to use only defaultStyle lineHeight
   */
  removeLineHeightFromElements(content: any): any {
    if (!content) return content;

    // Handle arrays
    if (Array.isArray(content)) {
      return content.map(item => this.removeLineHeightFromElements(item));
    }

    // Handle objects
    if (typeof content === 'object') {
      const processed: any = { ...content };

      // Remove lineHeight if it exists
      if ('lineHeight' in processed) {
        delete processed.lineHeight;
      }

      // Recursively process nested properties
      if (processed.text && Array.isArray(processed.text)) {
        processed.text = this.removeLineHeightFromElements(processed.text);
      }
      if (processed.stack && Array.isArray(processed.stack)) {
        processed.stack = this.removeLineHeightFromElements(processed.stack);
      }
      if (processed.columns && Array.isArray(processed.columns)) {
        processed.columns = this.removeLineHeightFromElements(processed.columns);
      }
      if (processed.table && processed.table.body && Array.isArray(processed.table.body)) {
        processed.table.body = this.removeLineHeightFromElements(processed.table.body);
      }
      if (processed.ul && Array.isArray(processed.ul)) {
        processed.ul = this.removeLineHeightFromElements(processed.ul);
      }
      if (processed.ol && Array.isArray(processed.ol)) {
        processed.ol = this.removeLineHeightFromElements(processed.ol);
      }

      return processed;
    }

    return content;
  }

  /**
   * Recursively fixes h1, h2, h3 fontSize (ignores any inline styles or CSS)
   * h1: 15px, h2: 13px, h3: 10px
   * This MUST be called AFTER applyTextSizeMultiplier to override multiplied sizes
   */
  fixHeadingFontSizes(content: any): any {
    if (!content) return content;

    // Handle arrays - process each item
    if (Array.isArray(content)) {
      return content.map(item => this.fixHeadingFontSizes(item));
    }

    // Handle objects
    if (typeof content === 'object') {
      const processed: any = { ...content };

      // Fix fontSize for heading elements - check nodeName first (most reliable)
      if (processed.nodeName === 'H1') {
        processed.fontSize = 16;
      } else if (processed.nodeName === 'H2') {
        processed.fontSize = 14;
      } else if (processed.nodeName === 'H3') {
        processed.fontSize = 12;
      } else {
        // Also check style array for heading classes as fallback
        if (Array.isArray(processed.style)) {
          const styleStr = processed.style.join(' ').toLowerCase();
          if (styleStr.includes('ql-size-huge') || styleStr.includes('h1') || styleStr.includes('heading-1')) {
            processed.fontSize = 16;
          } else if (styleStr.includes('ql-size-large') || styleStr.includes('h2') || styleStr.includes('heading-2')) {
            processed.fontSize = 14;
          } else if ((styleStr.includes('ql-size-small') && !styleStr.includes('ql-size-tiny')) || styleStr.includes('h3') || styleStr.includes('heading-3')) {
            processed.fontSize = 12;
          }
        }
      }

      // Recursively process nested properties - this is CRITICAL for nested headings
      // Process text first (headings are often in text arrays)
      if (processed.text) {
        if (Array.isArray(processed.text)) {
          processed.text = this.fixHeadingFontSizes(processed.text);
        } else if (typeof processed.text === 'object' && processed.text !== null) {
          processed.text = this.fixHeadingFontSizes(processed.text);
        }
      }
      if (processed.stack && Array.isArray(processed.stack)) {
        processed.stack = this.fixHeadingFontSizes(processed.stack);
      }
      if (processed.columns && Array.isArray(processed.columns)) {
        processed.columns = this.fixHeadingFontSizes(processed.columns);
      }
      if (processed.table && processed.table.body && Array.isArray(processed.table.body)) {
        processed.table.body = this.fixHeadingFontSizes(processed.table.body);
      }
      if (processed.ul && Array.isArray(processed.ul)) {
        processed.ul = this.fixHeadingFontSizes(processed.ul);
      }
      if (processed.ol && Array.isArray(processed.ol)) {
        processed.ol = this.fixHeadingFontSizes(processed.ol);
      }

      return processed;
    }

    return content;
  }

  /**
   * Recursively replaces CODE nodes in PDFMake content with values from placeholderData
   */
  replacePlaceholders(content: any, placeholderData?: Record<string, any>): any {
    if (!content) return content;
    if (!placeholderData) return content;

    // Handle arrays
    if (Array.isArray(content)) {
      return content.map(item => this.replacePlaceholders(item, placeholderData));
    }

    // Handle objects
    if (typeof content === 'object') {
      const processed: any = { ...content };

      // Check if this is a CODE node and replace with placeholderData value
      if (processed.nodeName === 'CODE') {
        let codeText: string | null = null;
        
        // Extract text from CODE node - handle different structures
        if (typeof processed.text === 'string') {
          codeText = processed.text.trim();
        } else if (Array.isArray(processed.text)) {
          // If text is an array, recursively process to find CODE nodes inside
          // First try to find a string element
          const firstText = processed.text.find((item: any) => typeof item === 'string');
          if (firstText) {
            codeText = firstText.trim();
          } else if (processed.text.length > 0) {
            // Process nested elements (might contain nested CODE nodes)
            processed.text = this.replacePlaceholders(processed.text, placeholderData);
            return processed;
          }
        } else if (typeof processed.text === 'object' && processed.text !== null) {
          // Recursively process nested object (might contain nested CODE nodes)
          processed.text = this.replacePlaceholders(processed.text, placeholderData);
          return processed;
        }
        
        // Check if the code text matches a key in placeholderData
        if (codeText && placeholderData.hasOwnProperty(codeText)) {
          // Replace CODE node with the actual value from placeholderData
          const value = placeholderData[codeText];
          // Return just the text value (PDFMake can handle string directly in arrays)
          // This makes it cleaner when CODE node is in a text array
          return typeof value === 'string' ? value : String(value);
        }
        
        // If no match found, keep processing nested content
        if (processed.text && Array.isArray(processed.text)) {
          processed.text = this.replacePlaceholders(processed.text, placeholderData);
        } else if (processed.text && typeof processed.text === 'object') {
          processed.text = this.replacePlaceholders(processed.text, placeholderData);
        }
        return processed;
      } else {
        // Recursively process nested properties for non-CODE nodes
        if (processed.text) {
          if (Array.isArray(processed.text)) {
            processed.text = this.replacePlaceholders(processed.text, placeholderData);
          } else if (typeof processed.text === 'object') {
            processed.text = this.replacePlaceholders(processed.text, placeholderData);
          }
        }
        if (processed.stack && Array.isArray(processed.stack)) {
          processed.stack = this.replacePlaceholders(processed.stack, placeholderData);
        }
        if (processed.columns && Array.isArray(processed.columns)) {
          processed.columns = this.replacePlaceholders(processed.columns, placeholderData);
        }
        if (processed.table && processed.table.body && Array.isArray(processed.table.body)) {
          processed.table.body = this.replacePlaceholders(processed.table.body, placeholderData);
        }
        if (processed.ul && Array.isArray(processed.ul)) {
          processed.ul = this.replacePlaceholders(processed.ul, placeholderData);
        }
        if (processed.ol && Array.isArray(processed.ol)) {
          processed.ol = this.replacePlaceholders(processed.ol, placeholderData);
        }
      }

      return processed;
    }

    return content;
  }

  /**
   * Recursively fixes margins in PDFMake content
   * Changes margin from [0, 5, 0, 10] to [0, 0, 0, 5]
   */
  fixMargins(content: any): any {
    if (!content) return content;

    // Handle arrays
    if (Array.isArray(content)) {
      return content.map(item => this.fixMargins(item));
    }

    // Handle objects
    if (typeof content === 'object') {
      const processed: any = { ...content };

      // Fix margin if it exists and matches the pattern [0, 5, 0, 10]
      if (Array.isArray(processed.margin) && processed.margin.length === 4) {
        const [left, top, right, bottom] = processed.margin;
        // Check if it matches [0, 5, 0, 10] pattern
        if (left === 0 && top === 5 && right === 0 && bottom === 10) {
          processed.margin = [0, 0, 0, 5];
        }
      }

      // Recursively process nested properties
      if (processed.text && Array.isArray(processed.text)) {
        processed.text = this.fixMargins(processed.text);
      } else if (processed.text && typeof processed.text === 'object' && processed.text !== null) {
        processed.text = this.fixMargins(processed.text);
      }
      if (processed.stack && Array.isArray(processed.stack)) {
        processed.stack = this.fixMargins(processed.stack);
      }
      if (processed.columns && Array.isArray(processed.columns)) {
        processed.columns = this.fixMargins(processed.columns);
      }
      if (processed.table && processed.table.body && Array.isArray(processed.table.body)) {
        processed.table.body = this.fixMargins(processed.table.body);
      }
      if (processed.ul && Array.isArray(processed.ul)) {
        processed.ul = this.fixMargins(processed.ul);
      }
      if (processed.ol && Array.isArray(processed.ol)) {
        processed.ol = this.fixMargins(processed.ol);
      }

      return processed;
    }

    return content;
  }

  /**
   * Recursively processes PDFMake content to convert ql-align-* classes to alignment property
   */
  processAlignmentClasses(content: any): any {
    if (!content) return content;

    // Handle arrays
    if (Array.isArray(content)) {
      return content.map(item => this.processAlignmentClasses(item));
    }

    // Handle objects
    if (typeof content === 'object') {
      const processed: any = { ...content };

      // Process style array to extract alignment classes
      if (Array.isArray(processed.style)) {
        const styleArray = processed.style;
        
        // Check for ql-align-* classes and convert to alignment property
        if (styleArray.includes('ql-align-center')) {
          processed.alignment = 'center';
        } else if (styleArray.includes('ql-align-right')) {
          processed.alignment = 'right';
        } else if (styleArray.includes('ql-align-left')) {
          processed.alignment = 'left';
        } else if (styleArray.includes('ql-align-justify')) {
          processed.alignment = 'justify';
        }

        // Remove ql-align-* classes from style array (optional, keeps it cleaner)
        processed.style = styleArray.filter((style: string) => 
          !style.startsWith('ql-align-')
        );

        // Remove style array if it's empty
        if (processed.style.length === 0) {
          delete processed.style;
        }
      }

      // Recursively process nested properties
      if (processed.text && Array.isArray(processed.text)) {
        processed.text = this.processAlignmentClasses(processed.text);
      }
      if (processed.stack && Array.isArray(processed.stack)) {
        processed.stack = this.processAlignmentClasses(processed.stack);
      }
      if (processed.columns && Array.isArray(processed.columns)) {
        processed.columns = this.processAlignmentClasses(processed.columns);
      }
      if (processed.table && processed.table.body && Array.isArray(processed.table.body)) {
        processed.table.body = this.processAlignmentClasses(processed.table.body);
      }
      if (processed.ul && Array.isArray(processed.ul)) {
        processed.ul = this.processAlignmentClasses(processed.ul);
      }
      if (processed.ol && Array.isArray(processed.ol)) {
        processed.ol = this.processAlignmentClasses(processed.ol);
      }

      return processed;
    }

    return content;
  }

  /**
   * Gets the text size multiplier based on text size option
   */
  getTextSizeMultiplier(textSize: 'normal' | 'large' | 'extralarge' = 'normal'): number {
    switch (textSize) {
      case 'large':
        return 1.25;
      case 'extralarge':
        return 1.5;
      default:
        return 1.0;
    }
  }

  /**
   * Generates PDF from HTML content
   */
  async generatePdfFromHtml(
    htmlContent: string,
    options: PdfGenerationOptions = {}
  ): Promise<PdfGenerationResult> {
    return new Promise((resolve, reject) => {
      try {
        // Remove line-height from HTML style attributes before converting to PDFMake
        htmlContent = this.removeLineHeightFromHtml(htmlContent);
        
        // Check if content is empty or just whitespace/empty tags
        const cleanContent = htmlContent?.replace(/<[^>]*>/g, '').trim() || '';
        if (!htmlContent || cleanContent.length === 0) {
          reject(new Error('HTML content is empty'));
          return;
        }
        
        const result = htmlToPdfMake(htmlContent, {
          tableAutoSize: true,
          removeExtraBlanks: false  // Preserve spacing
        });
        
        // Handle both cases: result can be content directly or object with content/images
        let pdfContent = result.content || result;
        const images = result.images;

        // Remove lineHeight from all elements first (so only defaultStyle lineHeight is used)
        pdfContent = this.removeLineHeightFromElements(pdfContent);

        // Fix margins (change [0, 5, 0, 10] to [0, 0, 0, 5])
        pdfContent = this.fixMargins(pdfContent);

        // Process alignment classes (convert ql-align-* to alignment property)
        pdfContent = this.processAlignmentClasses(pdfContent);
        
        // Replace placeholders with actual values
        if (options.placeholderData) {
          pdfContent = this.replacePlaceholders(pdfContent, options.placeholderData);
        }
        
        // Apply text size multiplier to all font sizes (including headings)
        const textSize = options.textSize || 'normal';
        const multiplier = this.getTextSizeMultiplier(textSize);
        pdfContent = this.applyTextSizeMultiplier(pdfContent, multiplier);

        // Fix heading font sizes (h1: 15px, h2: 13px, h3: 10px) - MUST be AFTER multiplier
        // This overrides the multiplied sizes for headings
        pdfContent = this.fixHeadingFontSizes(pdfContent);
        
        // Ensure pdfContent is an array
        if (!Array.isArray(pdfContent)) {
          pdfContent = [pdfContent];
        }
        
        // Add logo as first element if displayLogo is enabled
        if (options.displayLogo && options.logoBase64) {
          const logoElement = {
            image: options.logoBase64,
            width: 200,
            alignment: 'center'
          };
          pdfContent = [logoElement, ...pdfContent];
        }
        
        // Add cache as last element if displayCache is enabled
        if (options.displayCache && options.cacheBase64) {
          const cacheElement = {
            image: options.cacheBase64,
            width: 200,
            alignment: 'right'
          };
          pdfContent = [...pdfContent, cacheElement];
        }
        
        const baseFontSize = options.baseFontSize || 10;
        
        // Use Arial if available, otherwise fallback to Roboto
        const fontFamily = (pdfMake as any).fonts?.Arial ? 'Arial' : 'Roboto';
        
        const docDefinition: any = {
          content: pdfContent,
          pageSize: options.pageSize || 'A4',
          pageMargins: options.pageMargins || [40, 40, 40, 40],
          defaultStyle: {
            fontSize: Math.round(baseFontSize * multiplier * 100) / 100,  // Apply multiplier to default font size
            font: fontFamily,
            lineHeight: 1
          }
        };

        // Add images if present
        if (images) {
          docDefinition.images = images;
        }

        // Store PDFMake JSON for debug
        const pdfMakeJson = JSON.stringify(docDefinition, null, 2);

        pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
          if (dataUrl) {
            resolve({
              dataUrl,
              pdfMakeJson,
              docDefinition
            });
          } else {
            reject(new Error('Failed to generate PDF data URL'));
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generates PDF from PDFMake JSON definition
   */
  async generatePdfFromJson(jsonString: string): Promise<PdfGenerationResult> {
    return new Promise((resolve, reject) => {
      try {
        const docDefinition = JSON.parse(jsonString);
        
        // Store the JSON
        const pdfMakeJson = JSON.stringify(docDefinition, null, 2);

        pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
          if (dataUrl) {
            resolve({
              dataUrl,
              pdfMakeJson,
              docDefinition
            });
          } else {
            reject(new Error('Failed to generate PDF data URL'));
          }
        });
      } catch (error) {
        reject(new Error(`Invalid JSON format: ${error}`));
      }
    });
  }

  /**
   * Downloads a PDF file
   */
  downloadPdf(docDefinition: any, filename: string = 'document.pdf'): void {
    pdfMake.createPdf(docDefinition).download(filename);
  }

  /**
   * Opens a PDF in a new window
   */
  openPdfInNewWindow(docDefinition: any): void {
    pdfMake.createPdf(docDefinition).open();
  }

  /**
   * Prints a PDF
   */
  printPdf(docDefinition: any): void {
    pdfMake.createPdf(docDefinition).print();
  }
}

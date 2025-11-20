import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZardTextEditorComponent } from '@shared/components/text-editor/text-editor.component';
import htmlToPdfMake from 'html-to-pdfmake';
import { SafePipe } from '@shared/pipes/safe.pipe';
import { ZardPdfViewerComponent } from '@shared/pdf-viewer/pdf-viewer.component';
import { ZardFormFieldComponent } from '@shared/components/form/form.component';
import { ZardFormControlComponent } from '@shared/components/form/form.component';
import { ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardSegmentedComponent } from '@shared/components/segmented/segmented.component';
import { ChangeDetectorRef } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { PdfFontsService } from '@shared/services/pdf-fonts.service';

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

@Component({
  selector: 'app-document-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardPageComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardTextEditorComponent,
    ZardPdfViewerComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardSegmentedComponent,
    SafePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-edit.component.html',
})
export class DocumentEditComponent implements OnInit {
  @ViewChild('textEditor') textEditor!: ZardTextEditorComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly pdfFontsService = inject(PdfFontsService);

  readonly documentId = signal<string | null>(null);
  readonly isNew = computed(() => !this.documentId());
  readonly editorContent = signal<string>('');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  
  // Text size control
  readonly textSize = signal<'normal' | 'large' | 'extralarge'>('normal');
  readonly textSizeMultiplier = computed(() => {
    switch (this.textSize()) {
      case 'normal': return 1.0;
      case 'large': return 1.25;
      case 'extralarge': return 1.5;
      default: return 1.0;
    }
  });
  
  // PDF preview signals
  readonly pdfDataUrl = signal<string>('');
  readonly pdfMakeJson = signal<string>('');
  readonly isGeneratingPdf = signal(false);
  readonly showDebug = signal(false);
  readonly showPdfViewer = signal(false);

  // Textarea inputs
  readonly htmlInput = signal<string>('');
  readonly pdfMakeJsonInput = signal<string>('');

  readonly isFormValid = computed(() => {
    return this.editorContent().trim().length > 0;
  });

  // PDF URL with fit to page zoom
  readonly pdfDataUrlWithZoom = computed(() => {
    const url = this.pdfDataUrl();
    if (!url) return '';
    // Add zoom parameter to fit the page width
    return url + '#zoom=page-fit';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.documentId.set(id);
    
    // Try to load Arial fonts if available
    // Note: You need to provide Arial font files as base64 strings
    // See instructions in README_ARIAL_FONTS.md
    this.loadArialFontsIfAvailable();
    
    if (id) {
      this.loadDocument(id);
    } else {
      // Generate initial preview for new documents
      this.updatePdfPreview();
    }
  }

  /**
   * Load Arial fonts if they are available
   * To use Arial, you need to:
   * 1. Get Arial font files (TTF): Arial.ttf, Arial-Bold.ttf, Arial-Italic.ttf, Arial-BoldItalic.ttf
   * 2. Convert them to base64
   * 3. Create a file with the base64 strings and import them here
   * 
   * Example:
   * import { arialNormal, arialBold, arialItalic, arialBoldItalic } from '@assets/fonts/arial-fonts';
   * Then call: this.pdfFontsService.addArialFonts({ normal: arialNormal, bold: arialBold, ... });
   */
  private loadArialFontsIfAvailable(): void {
    // Uncomment and provide your Arial font base64 strings:
    /*
    import { arialNormal, arialBold, arialItalic, arialBoldItalic } from '@assets/fonts/arial-fonts';
    this.pdfFontsService.addArialFonts({
      normal: arialNormal,
      bold: arialBold,
      italics: arialItalic,
      bolditalics: arialBoldItalic
    });
    */
  }

  loadDocument(id: string): void {
    this.isLoading.set(true);
    // TODO: Implement actual API call to load document
    setTimeout(() => {
      this.isLoading.set(false);
    }, 500);
  }

  onEditorChange(html: string): void {
    this.editorContent.set(html);
    // Update PDF preview when editor content changes
    // Use setTimeout to ensure the signal update is processed
    setTimeout(() => {
      this.updatePdfPreview();
    }, 0);
  }

  onTextSizeChange(size: string): void {
    if (size === 'normal' || size === 'large' || size === 'extralarge') {
      this.textSize.set(size);
      // Update PDF preview when text size changes
      setTimeout(() => {
        this.updatePdfPreview();
      }, 0);
    }
  }

  /**
   * Recursively processes PDFMake content to apply text size multiplier to all font sizes
   */
  private applyTextSizeMultiplier(content: any, multiplier: number): any {
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
   * Recursively processes PDFMake content to convert ql-align-* classes to alignment property
   */
  private processAlignmentClasses(content: any): any {
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

  updatePdfPreview(): void {
    if (this.isGeneratingPdf()) return;
    
    const htmlContent = this.editorContent();
    
    // Check if content is empty or just whitespace/empty tags
    const cleanContent = htmlContent?.replace(/<[^>]*>/g, '').trim() || '';
    if (!htmlContent || cleanContent.length === 0) {
      this.pdfDataUrl.set('');
      this.pdfMakeJson.set('');
      return;
    }
    
    this.isGeneratingPdf.set(true);
    
    // Use setTimeout to ensure async processing doesn't block
    setTimeout(() => {
      try {
        const result = htmlToPdfMake(htmlContent, {
          tableAutoSize: true,
          removeExtraBlanks: false  // Preserve spacing
        });
        
        // Handle both cases: result can be content directly or object with content/images
        let pdfContent = result.content || result;
        const images = result.images;

        // Process alignment classes (convert ql-align-* to alignment property)
        pdfContent = this.processAlignmentClasses(pdfContent);
        
        // Apply text size multiplier to all font sizes
        const multiplier = this.textSizeMultiplier();
        pdfContent = this.applyTextSizeMultiplier(pdfContent, multiplier);
        
        const baseFontSize = 9.6; // Base font size in pt
        
        // Use Arial if available, otherwise fallback to Roboto
        const fontFamily = (pdfMake as any).fonts?.Arial ? 'Arial' : 'Roboto';
        
        const docDefinition: any = {
          content: pdfContent,
          pageSize: 'A4',
          pageMargins: [40, 40, 40, 40],
          defaultStyle: {
            fontSize: Math.round(baseFontSize * multiplier * 100) / 100,  // Apply multiplier to default font size
            lineHeight: 1.5,  // Matches text editor line-height: 1.5
            font: fontFamily
          }
        };

        // Add images if present
        if (images) {
          docDefinition.images = images;
        }

        // Store PDFMake JSON for debug
        this.pdfMakeJson.set(JSON.stringify(docDefinition, null, 2));

        pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
          if (dataUrl) {
            this.pdfDataUrl.set(dataUrl);
          }
          this.isGeneratingPdf.set(false);
          this.cdr.markForCheck();
        });
      } catch (error) {
        console.error('Error generating PDF preview:', error);
        this.isGeneratingPdf.set(false);
        this.pdfDataUrl.set('');
        this.cdr.markForCheck();
      }
    }, 100);
  }


  toggleDebug(): void {
    this.showDebug.set(!this.showDebug());
  }

  openPdfViewer(): void {
    if (this.pdfDataUrl()) {
      this.showPdfViewer.set(true);
    }
  }

  closePdfViewer(): void {
    this.showPdfViewer.set(false);
  }

  onCancel(): void {
    this.router.navigate(['/document']);
  }

  onSave(): void {
    if (!this.isFormValid()) {
      return;
    }

    this.isSaving.set(true);
    // TODO: Implement actual API call to save document
    setTimeout(() => {
      this.isSaving.set(false);
      this.router.navigate(['/document']);
    }, 1000);
  }

  insertHtmlIntoEditor(): void {
    const html = this.htmlInput().trim();
    if (!html) return;

    if (!this.textEditor) {
      console.warn('Text editor is not ready yet');
      return;
    }

    this.textEditor.setHtml(html);
    // Update editor content signal
    const updatedHtml = this.textEditor.getHtml();
    this.editorContent.set(updatedHtml);
    // Clear the textarea
    this.htmlInput.set('');
    // Update PDF preview
    setTimeout(() => {
      this.updatePdfPreview();
    }, 0);
  }

  generatePdfFromJson(): void {
    const jsonString = this.pdfMakeJsonInput().trim();
    if (!jsonString) return;

    try {
      const docDefinition = JSON.parse(jsonString);
      
      this.isGeneratingPdf.set(true);
      
      // Store the JSON
      this.pdfMakeJson.set(JSON.stringify(docDefinition, null, 2));

      pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
        if (dataUrl) {
          this.pdfDataUrl.set(dataUrl);
        }
        this.isGeneratingPdf.set(false);
        this.cdr.markForCheck();
      });
    } catch (error) {
      console.error('Error parsing PDFMake JSON:', error);
      alert('Invalid JSON format. Please check your PDFMake JSON.');
      this.isGeneratingPdf.set(false);
      this.cdr.markForCheck();
    }
  }
}


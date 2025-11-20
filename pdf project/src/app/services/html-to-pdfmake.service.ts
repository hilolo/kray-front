import { Injectable } from '@angular/core';

export interface HtmlToPdfMakeOptions {
  defaultStyles?: { [key: string]: any };
  tableAutoSize?: boolean;
  imagesByReference?: boolean;
  removeExtraBlanks?: boolean;
  showHidden?: boolean;
  removeTagClasses?: boolean;
  ignoreStyles?: string[];
  fontSizes?: number[];
  customTag?: (params: { element: any; parents: any[]; ret: any }) => any;
  replaceText?: (text: string, nodes: any[]) => string;
}

@Injectable({
  providedIn: 'root'
})
export class HtmlToPdfmakeService {
  private wndw: Window = window;
  private tableAutoSize: boolean = false;
  private imagesByReference: boolean = false;
  private removeExtraBlanks: boolean = false;
  private showHidden: boolean = false;
  private removeTagClasses: boolean = false;
  private ignoreStyles: string[] = [];
  private fontSizes: number[] = [10, 14, 16, 18, 20, 24, 28];
  private defaultStyles: { [key: string]: any } = {};
  private imagesRef: string[] = [];
  private options?: HtmlToPdfMakeOptions;
  private imagesByReferenceSuffix: string = '';

  constructor() { }

  /**
   * Transform HTML code to a PdfMake object
   * @param htmlText The HTML code to transform
   * @param options Configuration options
   * @returns Object with {content, styles, images?} for pdfMake
   */
  convertHtmlToPdfmake(htmlText: string, options?: HtmlToPdfMakeOptions): any {
    // Initialize options
    this.options = options;
    this.wndw = window;
    this.tableAutoSize = options?.tableAutoSize ?? false;
    this.imagesByReference = options?.imagesByReference ?? false;
    this.removeExtraBlanks = options?.removeExtraBlanks ?? false;
    this.showHidden = options?.showHidden ?? false;
    this.removeTagClasses = options?.removeTagClasses ?? false;
    this.ignoreStyles = options?.ignoreStyles ?? [];
    // Font sizes converted from px to pt: 1px = 0.803571pt
    this.fontSizes = options?.fontSizes ?? [8.04, 11.25, 12.86, 14.46, 16.07, 19.29, 22.50];
    
    // A random string to be used in the image references
    this.imagesByReferenceSuffix = Math.random().toString(36).slice(2, 8);
    
    // Set default styles - match editor styling with distinct header sizes
    // These will be used as pdfMake style definitions
    // Font sizes converted from px to pt using ratio: 1px = 0.803571pt (14px = 11.25pt)
    this.defaultStyles = {
      b: { bold: true },
      strong: { bold: true },
      u: { decoration: 'underline' },
      del: { decoration: 'lineThrough' },
      s: { decoration: 'lineThrough' },
      em: { italics: true },
      i: { italics: true },
      h1: { fontSize: 25.71, bold: true, margin: [0, 0, 0, 8], lineHeight: 1.5 },
      h2: { fontSize: 20.89, bold: true, margin: [0, 0, 0, 6], lineHeight: 1.5 },
      h3: { fontSize: 16.88, bold: true, margin: [0, 0, 0, 6], lineHeight: 1.5 },
      h4: { fontSize: 16.07, bold: true, margin: [0, 0, 0, 5], lineHeight: 1.5 },
      h5: { fontSize: 14.46, bold: true, margin: [0, 0, 0, 5], lineHeight: 1.5 },
      h6: { fontSize: 12.86, bold: true, margin: [0, 0, 0, 5], lineHeight: 1.5 },
      a: { color: 'blue', decoration: 'underline' },
      strike: { decoration: 'lineThrough' },
      p: { fontSize: 11.25, margin: [0, 0, 0, 5], lineHeight: 1.5 },
      ul: { margin: [0, 0, 0, 5], lineHeight: 1.5 },
      table: { margin: [0, 0, 0, 5] },
      th: { bold: true, fillColor: '#EEEEEE' }
    };

    // Reset images ref
    this.imagesRef = [];

    // Change default styles if provided
    if (options?.defaultStyles) {
      this.changeDefaultStyles(options.defaultStyles);
    }

    const content = this.convertHtml(htmlText);
    
    // Build the pdfMake styles object from defaultStyles
    const styles: { [key: string]: any } = {};
    for (const key in this.defaultStyles) {
      if (this.defaultStyles.hasOwnProperty(key)) {
        styles[key] = { ...this.defaultStyles[key] };
      }
    }
    
    // Prepare return object with content and styles
    const result: any = {
      content: content,
      styles: styles
    };
    
    // if images by reference
    if (this.imagesByReference) {
      const images: { [key: string]: any } = {};
      this.imagesRef.forEach((src, i) => {
        images['img_ref_' + this.imagesByReferenceSuffix + i] = 
          (src.startsWith('{') ? JSON.parse(src) : src);
      });
      result.images = images;
    }
    
    return result;
  }

  private changeDefaultStyles(customStyles: { [key: string]: any }): void {
    for (const keyStyle in customStyles) {
      if (this.defaultStyles.hasOwnProperty(keyStyle)) {
        if (!customStyles[keyStyle]) {
          delete this.defaultStyles[keyStyle];
        } else {
          for (const k in customStyles[keyStyle]) {
            if (customStyles[keyStyle][k] === '') {
              delete this.defaultStyles[keyStyle][k];
            } else {
              this.defaultStyles[keyStyle][k] = customStyles[keyStyle][k];
            }
          }
        }
      } else {
        this.defaultStyles[keyStyle] = {};
        for (const ks in customStyles[keyStyle]) {
          this.defaultStyles[keyStyle][ks] = customStyles[keyStyle][ks];
        }
      }
    }
  }

  private convertHtml(htmlText: string): any {
    const parser = new DOMParser();
    
    if (this.removeExtraBlanks) {
      htmlText = htmlText
        .replace(/(<\/?(div|p|h1|h2|h3|h4|h5|h6|ol|ul|li)([^>]+)?>)\s+(<\/?(div|p|h1|h2|h3|h4|h5|h6|ol|ul|li))/gi, '$1$4')
        .replace(/(<\/?(div|p|h1|h2|h3|h4|h5|h6|ol|ul|li)([^>]+)?>)\s+(<\/?(div|p|h1|h2|h3|h4|h5|h6|ol|ul|li))/gi, '$1$4')
        .replace(/(<td([^>]+)?>)\s+(<table)/gi, '$1$3')
        .replace(/(<\/table>)\s+(<\/td>)/gi, '$1$2');
    }
    
    const parsedHtml = parser.parseFromString(htmlText, 'text/html');
    const docDef = this.parseElement(parsedHtml.body, []);
    
    return docDef.stack || docDef.text;
  }

  private parseElement(element: any, parents: any[]): any {
    const nodeName = element.nodeName.toUpperCase();
    const nodeNameLowerCase = nodeName.toLowerCase();
    let ret: any = { text: [] };
    let text: any;
    let needStack = false;
    let dataset: any;
    let i: number;
    let key: string;

    // ignore some HTML tags
    if (['COLGROUP', 'COL'].indexOf(nodeName) > -1) return '';

    switch (element.nodeType) {
      case 3: { // TEXT_NODE
        if (element.textContent) {
          text = element.textContent;
          
          // check if we have 'white-space' in the parent's style
          const styleParentTextNode = this.parseStyle(parents[parents.length - 1], true);
          let hasWhiteSpace = (parents.findIndex((p: any) => p.nodeName === 'PRE') > -1);
          
          for (i = 0; i < styleParentTextNode.length; i++) {
            if (styleParentTextNode[i].key === 'preserveLeadingSpaces') {
              hasWhiteSpace = styleParentTextNode[i].value;
              break;
            }
          }
          
          if (!hasWhiteSpace) {
            // Replace newlines with spaces but preserve other whitespace
            text = text.replace(/\s*\n\s*/g, ' ');
            // Normalize multiple spaces to single space (except non-breaking spaces)
            text = text.replace(/[ \t]+/g, ' ');
          }
          
          // Replace non-breaking spaces (U+00A0) with regular spaces for better PDF rendering
          // PDFMake handles spacing through its own layout engine
          text = text.replace(/\u00A0/g, ' ');
          
          if (this.options && typeof this.options.replaceText === 'function') {
            text = this.options.replaceText(text, parents);
          }

          // for table, thead, tbody, tfoot, tr, ul, ol: remove all empty space
          if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'UL', 'OL'].indexOf(parents[parents.length - 1]?.nodeName) > -1) {
            text = text.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
          }
          
          if (text) {
            ret = { text };
            ret = this.applyStyle({ ret, parents });
            return ret;
          }
        }
        return '';
      }
      
      case 1: { // ELEMENT_NODE
        if (!this.showHidden && 
            ((element.style.display && element.style.display === 'none') || 
             (element.style.visibility && element.style.visibility === 'hidden'))) {
          return '';
        }

        ret.nodeName = nodeName;
        if (element.id) ret.id = element.id;
        parents.push(element);

        if (element.childNodes && element.childNodes.length > 0) {
          Array.from(element.childNodes).forEach((child: any) => {
            const res = this.parseElement(child, parents);
            if (res) {
              if (Array.isArray(res.text) && res.text.length === 0) res.text = '';
              ret.text.push(res);
            }
          });
          
          needStack = this.searchForStack(ret);
          if (needStack) {
            ret.stack = ret.text.slice(0);
            delete ret.text;
          } else {
            ret = this.applyStyle({ ret, parents });
          }
        }
        
        parents.pop();

        ret = this.handleSpecialTags(element, ret, parents, nodeName, nodeNameLowerCase);

        return ret;
      }
    }
    
    return ret;
  }

  private handleSpecialTags(element: any, ret: any, parents: any[], nodeName: string, nodeNameLowerCase: string): any {
    switch (nodeName) {
      case 'TABLE':
        return this.handleTable(element, ret, parents);
      case 'TH':
      case 'TD':
        return this.handleTableCell(element, ret, parents);
      case 'SVG':
        return this.handleSvg(element, ret);
      case 'BR':
        ret.text = [{ text: '\n' }];
        return ret;
      case 'SUB':
      case 'SUP':
        ret[nodeName.toLowerCase()] = { offset: '30%', fontSize: 8 };
        return ret;
      case 'HR':
        return this.handleHr(element);
      case 'OL':
      case 'UL':
        return this.handleList(element, ret, parents, nodeNameLowerCase);
      case 'LI':
        return this.handleListItem(ret);
      case 'PRE':
        ret.preserveLeadingSpaces = true;
        return ret;
      case 'IMG':
        return this.handleImage(element, ret, parents);
      case 'A':
        return this.handleLink(element, ret);
      default:
        return this.handleDefaultTag(element, ret, parents, nodeName);
    }
  }

  private handleTable(element: any, ret: any, parents: any[]): any {
    ret.table = { body: [] };
    const tbodies = ret.stack || ret.text;
    
    if (Array.isArray(tbodies)) {
      let rowIndex = 0;
      let hasRowSpan = false;
      
      tbodies.forEach((tbody: any) => {
        const rows = tbody.stack || tbody.text;
        if (Array.isArray(rows)) {
          rows.forEach((row: any) => {
            const cells = row.stack || row.text;
            if (Array.isArray(cells)) {
              ret.table.body[rowIndex] = [];
              cells.forEach((cell: any) => {
                ret.table.body[rowIndex].push(cell);
                
                if (cell.colSpan > 1) {
                  let i = cell.colSpan;
                  while (--i > 0) {
                    ret.table.body[rowIndex].push({ text: '' });
                  }
                }
                
                if (cell.rowSpan > 1) hasRowSpan = true;
              });
              rowIndex++;
            }
          });
        }
      });

      if (hasRowSpan) {
        this.handleRowSpan(ret);
      }
    }

    delete ret.stack;
    delete ret.text;
    ret = this.applyStyle({ ret, parents: parents.concat([element]) });

    if (this.tableAutoSize) {
      this.applyTableAutoSize(element, ret);
    }

    // Handle data-pdfmake attribute
    if (element.dataset && element.dataset.pdfmake) {
      const dataset = JSON.parse(element.dataset.pdfmake.replace(/'/g, '"'));
      for (const key in dataset) {
        if (key === 'layout') {
          ret.layout = dataset[key];
        } else {
          ret.table[key] = dataset[key];
        }
      }
    }

    return ret;
  }

  private handleRowSpan(ret: any): void {
    const header = ret.table.body[0];
    if (!Array.isArray(header)) return;

    const columnsCount = header.length;
    const rowsCount = ret.table.body.length;

    for (let columnInd = 0; columnInd < columnsCount; columnInd++) {
      for (let rowInd = 0; rowInd < rowsCount; rowInd++) {
        const row = ret.table.body[rowInd];
        if (Array.isArray(row)) {
          const cell = row[columnInd];
          if (cell.rowSpan > 1) {
            const len = cell.rowSpan;
            const colspan = cell.colSpan || 1;
            for (let j = 1; j <= len - 1; j++) {
              let cs = colspan;
              if (ret.table.body[rowInd + j]) {
                while (cs--) {
                  ret.table.body[rowInd + j].splice(columnInd, 0, { text: '' });
                }
              } else {
                cell.rowSpan--;
              }
            }
            rowInd += (len - 1);
          }
        }
      }
    }
  }

  private applyTableAutoSize(element: any, ret: any): void {
    const cellsWidths: any[][] = [];
    const cellsHeights: any[][] = [];
    const tableWidths: any[] = [];
    const tableHeights: any[] = [];

    const fullWidth = (element.getAttribute('width') === '100%' || element.style.width === '100%');
    const elementAttrWidth = element.getAttribute('width') || '';
    const tableHaveWidth = (element.style.width || elementAttrWidth).endsWith('%');
    let tableWidth = 0;
    
    if (tableHaveWidth) {
      tableWidth = parseFloat((element.style.width || elementAttrWidth).replace(/[^0-9.]/g, ''));
    }

    ret.table.body.forEach((row: any[], rowIndex: number) => {
      cellsWidths.push([]);
      cellsHeights.push([]);
      row.forEach((cell: any) => {
        let width = typeof cell.width !== 'undefined' ? cell.width : 'auto';
        if (width === '*') width = 'auto';
        let height = typeof cell.height !== 'undefined' ? cell.height : 'auto';
        if (height === '*') height = 'auto';

        if (width !== 'auto' && cell.colSpan > 1) {
          if (!isNaN(width)) width /= cell.colSpan;
          else width = 'auto';
        }
        if (height !== 'auto' && cell.rowSpan > 1) {
          if (!isNaN(height)) height /= cell.rowSpan;
          else height = 'auto';
        }

        cellsWidths[rowIndex].push(width);
        cellsHeights[rowIndex].push(height);
      });
    });

    cellsWidths.forEach((row: any[]) => {
      row.forEach((cellWidth: any, cellIndex: number) => {
        const type = typeof tableWidths[cellIndex];
        if (type === 'undefined' || 
            (cellWidth !== 'auto' && type === 'number' && cellWidth > tableWidths[cellIndex]) || 
            (cellWidth !== 'auto' && tableWidths[cellIndex] === 'auto')) {
          if (tableHaveWidth) {
            const cellPercentage = cellWidth === 'auto' 
              ? tableWidth / row.length 
              : (parseFloat(cellWidth.toString().replace('%', '')) * tableWidth) / 100;
            cellWidth = String(cellPercentage) + '%';
          }
          tableWidths[cellIndex] = cellWidth;
        }
      });
    });

    cellsHeights.forEach((row: any[], rowIndex: number) => {
      row.forEach((cellHeight: any) => {
        const type = typeof tableHeights[rowIndex];
        if (type === 'undefined' || 
            (cellHeight !== 'auto' && type === 'number' && cellHeight > tableHeights[rowIndex]) || 
            (cellHeight !== 'auto' && tableHeights[rowIndex] === 'auto')) {
          tableHeights[rowIndex] = cellHeight;
        }
      });
    });

    if (tableWidths.length > 0) {
      if (fullWidth) {
        ret.table.widths = tableWidths.map((w: any) => w === 'auto' ? '*' : w);
      } else {
        ret.table.widths = tableWidths;
      }
    }
    if (tableHeights.length > 0) ret.table.heights = tableHeights;
  }

  private handleTableCell(element: any, ret: any, parents: any[]): any {
    if (element.getAttribute('rowspan')) {
      ret.rowSpan = element.getAttribute('rowspan') * 1;
    }
    if (element.getAttribute('colspan')) {
      ret.colSpan = element.getAttribute('colspan') * 1;
    }
    ret = this.applyStyle({ ret, parents: parents.concat([element]) });
    return ret;
  }

  private handleSvg(element: any, ret: any): any {
    ret = {
      svg: element.outerHTML.replace(/\n(\s+)?/g, ''),
      nodeName: 'SVG'
    };
    if (!this.removeTagClasses) ret.style = ['html-svg'];
    return ret;
  }

  private handleHr(element: any): any {
    const styleHR: any = {
      width: 514,
      type: 'line',
      margin: [0, 12, 0, 12],
      thickness: 0.5,
      color: '#000000',
      left: 0
    };

    if (element.dataset && element.dataset.pdfmake) {
      const dataset = JSON.parse(element.dataset.pdfmake.replace(/'/g, '"'));
      for (const key in dataset) {
        styleHR[key] = dataset[key];
      }
    }

    return {
      margin: styleHR.margin,
      canvas: [{
        type: styleHR.type,
        x1: styleHR.left,
        y1: 0,
        x2: styleHR.width,
        y2: 0,
        lineWidth: styleHR.thickness,
        lineColor: styleHR.color
      }]
    };
  }

  private handleList(element: any, ret: any, parents: any[], nodeNameLowerCase: string): any {
    ret[nodeNameLowerCase] = (ret.stack || ret.text).slice(0);
    delete ret.stack;
    delete ret.text;

    ret = this.applyStyle({ ret, parents: parents.concat([element]) });

    if (element.getAttribute('start')) {
      ret.start = element.getAttribute('start') * 1;
    }

    switch (element.getAttribute('type')) {
      case 'A': ret.type = 'upper-alpha'; break;
      case 'a': ret.type = 'lower-alpha'; break;
      case 'I': ret.type = 'upper-roman'; break;
      case 'i': ret.type = 'lower-roman'; break;
    }

    if (ret.listStyle || ret.listStyleType) {
      ret.type = ret.listStyle || ret.listStyleType;
    }

    return ret;
  }

  private handleListItem(ret: any): any {
    if (ret.stack && !ret.stack[ret.stack.length - 1].text) {
      const text = ret.stack.slice(0, -1);
      ret = [
        (Array.isArray(text) && text.filter((child: any) => !child.text).length > 0 
          ? { stack: text } 
          : { text }),
        ret.stack[ret.stack.length - 1]
      ];
    }
    
    if (Array.isArray(ret)) {
      ret = { stack: ret };
    }
    
    return ret;
  }

  private handleImage(element: any, ret: any, parents: any[]): any {
    if (this.imagesByReference) {
      const src = element.getAttribute('data-src') || element.getAttribute('src');
      const index = this.imagesRef.indexOf(src);
      if (index > -1) {
        ret.image = 'img_ref_' + this.imagesByReferenceSuffix + index;
      } else {
        ret.image = 'img_ref_' + this.imagesByReferenceSuffix + this.imagesRef.length;
        this.imagesRef.push(src);
      }
    } else {
      ret.image = element.getAttribute('src');
    }
    
    delete ret.stack;
    delete ret.text;
    ret = this.applyStyle({ ret, parents: parents.concat([element]) });
    
    // IMPORTANT: Check for alignment AFTER applyStyle to ensure it's not overridden
    // This must be done last to take precedence
    
    // Check image's own alignment classes (from Quill editor) - HIGHEST PRIORITY
    const imgClass = element.getAttribute('class') || '';
    if (imgClass.includes('ql-align-center')) {
      ret.alignment = 'center';
    } else if (imgClass.includes('ql-align-right')) {
      ret.alignment = 'right';
    } else if (imgClass.includes('ql-align-left')) {
      ret.alignment = 'left';
    }
    
    // Check for alignment from ret.style array (added by applyStyle)
    if (ret.style && Array.isArray(ret.style)) {
      if (ret.style.includes('ql-align-center')) {
        ret.alignment = 'center';
      } else if (ret.style.includes('ql-align-right')) {
        ret.alignment = 'right';
      } else if (ret.style.includes('ql-align-left')) {
        ret.alignment = 'left';
      }
    }
    
    // Check parent element alignment as fallback
    const parentElement = element.parentElement;
    if (!ret.alignment && parentElement) {
      const parentClass = parentElement.getAttribute('class') || '';
      if (parentClass.includes('ql-align-center')) {
        ret.alignment = 'center';
      } else if (parentClass.includes('ql-align-right')) {
        ret.alignment = 'right';
      } else if (parentClass.includes('ql-align-left')) {
        ret.alignment = 'left';
      }
      
      const parentStyle = window.getComputedStyle(parentElement);
      const textAlign = parentStyle.textAlign || parentElement.style.textAlign;
      
      if (!ret.alignment && (textAlign === 'center' || textAlign === 'middle')) {
        ret.alignment = 'center';
      } else if (!ret.alignment && textAlign === 'right') {
        ret.alignment = 'right';
      }
    }
    
    // Check inline style for margin auto (CSS centering)
    const imgStyle = element.style;
    if (!ret.alignment && imgStyle) {
      const display = imgStyle.display;
      const marginLeft = imgStyle.marginLeft;
      const marginRight = imgStyle.marginRight;
      
      if (display === 'block' && marginLeft === 'auto' && marginRight === 'auto') {
        ret.alignment = 'center';
      }
    }
    
    return ret;
  }

  private handleLink(element: any, ret: any): any {
    const setLink = (pointer: any, href: string): any => {
      pointer = pointer || { text: '' };
      if (Array.isArray(pointer.text)) {
        pointer.text = pointer.text.map((text: any) => setLink(text, href));
        return pointer;
      } else if (Array.isArray(pointer.stack)) {
        pointer.stack = pointer.stack.map((stack: any) => setLink(stack, href));
        return pointer;
      }
      
      if (href.indexOf('#') === 0) {
        pointer.linkToDestination = href.slice(1);
      } else {
        pointer.link = href;
      }
      return pointer;
    };

    if (element.getAttribute('href')) {
      ret = setLink(ret, element.getAttribute('href'));
      if (Array.isArray(ret.text) && ret.text.length === 1) {
        ret = ret.text[0];
      }
      ret.nodeName = 'A';
    }
    
    return ret;
  }

  private handleDefaultTag(element: any, ret: any, parents: any[], nodeName: string): any {
    if (nodeName === 'DIV' && element.dataset && element.dataset.pdfmakeType === 'columns') {
      if (ret.stack) {
        ret.columns = ret.stack;
        delete ret.stack;
      }
    } else if (this.options && typeof this.options.customTag === 'function') {
      ret = this.options.customTag.call(this, { element, parents, ret });
    }

    // Reduce the number of JSON properties
    if (Array.isArray(ret.text) && ret.text.length === 1 && ret.text[0].text && !ret.text[0].nodeName) {
      ret.text = ret.text[0].text;
    }

    // Handle empty LI elements
    if (((parents.length > 0 && parents[parents.length - 1].nodeName === 'LI') || nodeName === 'LI') &&
        ((Array.isArray(ret.text) && ret.text.length === 0) || (typeof ret.text === 'string' && ret.text === ''))) {
      ret.text = ' ';
    }

    // Handle data-pdfmake attribute
    if (['HR', 'TABLE'].indexOf(nodeName) === -1 && element.dataset && element.dataset.pdfmake) {
      const dataset = JSON.parse(element.dataset.pdfmake.replace(/'/g, '"'));
      for (const key in dataset) {
        ret[key] = dataset[key];
      }
    }

    return ret;
  }

  private searchForStack(ret: any): boolean {
    if (Array.isArray(ret.text)) {
      // Check if we have multiple images on the same line
      const imageCount = ret.text.filter((item: any) => item.nodeName === 'IMG').length;
      const hasOnlyImagesAndSpaces = ret.text.every((item: any) => 
        item.nodeName === 'IMG' || (typeof item.text === 'string' && item.text.trim() === '')
      );
      
      // If we have multiple images on the same line, convert to columns for horizontal layout
      if (imageCount > 1 && hasOnlyImagesAndSpaces) {
        const images = ret.text.filter((item: any) => item.nodeName === 'IMG');
        ret.columns = images;
        delete ret.text;
        return false; // Don't use stack, we're using columns
      }
      
      // Count block-level elements that require stacking
      let blockLevelCount = 0;
      
      for (let i = 0; i < ret.text.length; i++) {
        const item = ret.text[i];
        
        // Check if this is a block-level element
        const isBlockLevel = item.stack || 
          ['P', 'DIV', 'TABLE', 'SVG', 'UL', 'OL', 'IMG', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
            .indexOf(item.nodeName) > -1;
        
        if (isBlockLevel) {
          blockLevelCount++;
        }
        
        // Recursively check nested elements
        if (this.searchForStack(item) === true) {
          blockLevelCount++;
        }
      }
      
      // Only create a stack if we have actual block-level elements
      // If we only have inline text elements (SPAN, STRONG, EM, etc.), keep them inline
      if (blockLevelCount > 0) {
        return true;
      }
      
      // Check if all items are simple text or inline elements
      const allInline = ret.text.every((item: any) => {
        // Simple text strings
        if (typeof item === 'string') return true;
        if (typeof item.text === 'string') return true;
        // Inline elements with text children
        if (Array.isArray(item.text) && item.text.every((t: any) => typeof t === 'string' || typeof t.text === 'string')) {
          return true;
        }
        return false;
      });
      
      // If all elements are inline, don't create a stack
      if (allInline) {
        return false;
      }
    }
    return false;
  }

  private applyStyle(params: { ret: any; parents: any[] }): any {
    const cssClass: string[] = [];
    const lastIndex = params.parents.length - 1;

    params.parents.forEach((parent: any, parentIndex: number) => {
      const parentNodeName = parent.nodeName.toLowerCase();
      
      if (!this.removeTagClasses) {
        const htmlClass = 'html-' + parentNodeName;
        if (htmlClass !== 'html-body' && cssClass.indexOf(htmlClass) === -1) {
          cssClass.unshift(htmlClass);
        }
      }

      const parentClass = (parent.getAttribute('class') || '').split(' ');
      parentClass.forEach((p: string) => {
        if (p) cssClass.push(p);
      });

      let ignoreNonDescendentProperties = (parentIndex !== lastIndex);

      // Apply default styles
      if (this.defaultStyles[parentNodeName]) {
        for (const style in this.defaultStyles[parentNodeName]) {
          if (this.defaultStyles[parentNodeName].hasOwnProperty(style)) {
            if (!ignoreNonDescendentProperties || 
                (ignoreNonDescendentProperties && 
                 style.indexOf('margin') === -1 && 
                 style.indexOf('border') === -1)) {
              if (style === 'decoration') {
                if (!Array.isArray(params.ret[style])) params.ret[style] = [];
                if (this.defaultStyles[parentNodeName][style] && 
                    params.ret[style].indexOf(this.defaultStyles[parentNodeName][style]) === -1) {
                  params.ret[style].push(this.defaultStyles[parentNodeName][style]);
                }
              } else if (style === 'bold' || style === 'italics') {
                // For bold and italics, only set if true (don't override existing true values)
                if (this.defaultStyles[parentNodeName][style] === true) {
                  params.ret[style] = true;
                }
              } else {
                // Only set if not already defined or if this is the direct parent
                if (typeof params.ret[style] === 'undefined' || !ignoreNonDescendentProperties) {
                  params.ret[style] = JSON.parse(JSON.stringify(this.defaultStyles[parentNodeName][style]));
                }
              }
            }
          }
        }
      }

      // Apply element's style
      if (parentNodeName === 'tr') ignoreNonDescendentProperties = false;
      const styles = this.parseStyle(parent, ignoreNonDescendentProperties);
      styles.forEach((stl: any) => {
        if (stl.key === 'decoration') {
          if (!Array.isArray(params.ret[stl.key])) params.ret[stl.key] = [];
          params.ret[stl.key].push(stl.value);
        } else if (['UL', 'OL'].includes(params.ret.nodeName) && stl.key === 'alignment') {
          // ignore alignment for UL/OL
        } else {
          if (params.ret.margin && stl.key.indexOf('margin') === 0) {
            switch (stl.key) {
              case 'marginLeft': params.ret.margin[0] = stl.value; break;
              case 'marginTop': params.ret.margin[1] = stl.value; break;
              case 'marginRight': params.ret.margin[2] = stl.value; break;
              case 'marginBottom': params.ret.margin[3] = stl.value; break;
            }
          } else {
            params.ret[stl.key] = stl.value;
          }
        }
      });
    });

    if (cssClass.length > 0) params.ret.style = cssClass;
    
    // Convert Quill alignment classes to PDFMake alignment property
    if (cssClass.includes('ql-align-center')) {
      params.ret.alignment = 'center';
    } else if (cssClass.includes('ql-align-right')) {
      params.ret.alignment = 'right';
    } else if (cssClass.includes('ql-align-left')) {
      params.ret.alignment = 'left';
    } else if (cssClass.includes('ql-align-justify')) {
      params.ret.alignment = 'justify';
    }
    
    return params.ret;
  }

  private parseStyle(element: any, ignoreProperties: boolean): any[] {
    let style = element.getAttribute('style') || '';
    const ret: any[] = [];
    style = style.replace(/!important/g, '').split(';');

    const width = element.getAttribute('width');
    const height = element.getAttribute('height');
    if (width) {
      style.unshift('width:' + this.convertToUnit(width + (isNaN(width) ? '' : 'px')));
    }
    if (height) {
      style.unshift('height:' + this.convertToUnit(height + (isNaN(height) ? '' : 'px')));
    }

    const color = element.getAttribute('color');
    if (color) {
      ret.push({ key: 'color', value: this.parseColor(color).color });
    }

    const size = element.getAttribute('size');
    if (size !== null) {
      const sizeValue = Math.min(Math.max(1, parseInt(size)), 7);
      ret.push({ key: 'fontSize', value: Math.max(this.fontSizes[0], this.fontSizes[sizeValue - 1]) });
    }

    const styleDefs = style.map((s: string) => s.toLowerCase().split(':'));
    const borders: any[] = [];
    const nodeName = element.nodeName.toUpperCase();

    styleDefs.forEach((styleDef: string[]) => {
      if (styleDef.length === 2) {
        const key = styleDef[0].trim().toLowerCase();
        let value = styleDef[1].trim();

        if (this.ignoreStyles.indexOf(key) === -1) {
          this.parseStyleProperty(key, value, ignoreProperties, nodeName, ret, borders);
        }
      }
    });

    if (borders.length > 0) {
      this.processBorders(borders, ret);
    }

    return ret;
  }

  private parseStyleProperty(key: string, value: string, ignoreProperties: boolean, 
                             nodeName: string, ret: any[], borders: any[]): void {
    switch (key) {
      case 'margin':
        if (!ignoreProperties) {
          this.parseMargin(value, ret);
        }
        break;
      case 'line-height':
        this.parseLineHeight(value, ret);
        break;
      case 'text-align':
        ret.push({ key: 'alignment', value });
        break;
      case 'font-weight':
        ret.push({ key: 'bold', value: value === 'bold' || parseInt(value) >= 700 });
        break;
      case 'text-decoration':
        this.parseTextDecoration(value, ret);
        break;
      case 'font-style':
        if (value === 'italic') ret.push({ key: 'italics', value: true });
        break;
      case 'font-family':
        this.parseFontFamily(value, ret);
        break;
      case 'color':
        this.parseColorStyle(value, ret);
        break;
      case 'background-color':
        this.parseBackgroundColor(value, nodeName, ret);
        break;
      case 'text-indent':
        ret.push({ key: 'leadingIndent', value: this.convertToUnit(value) });
        break;
      case 'white-space':
        this.parseWhiteSpace(value, ret);
        break;
      default:
        if (key.indexOf('border') === 0) {
          if (!ignoreProperties) borders.push({ key, value });
        } else {
          this.parseOtherStyles(key, value, ignoreProperties, nodeName, ret);
        }
    }
  }

  private parseMargin(value: string, ret: any[]): void {
    let values = value.split(' ');
    if (values.length === 1) values = [values[0], values[0], values[0], values[0]];
    else if (values.length === 2) values = [values[1], values[0]];
    else if (values.length === 3) values = [values[1], values[0], values[1], values[2]];
    else if (values.length === 4) values = [values[3], values[0], values[1], values[2]];

    const convertedValues = values.map(val => {
      if (val === 'auto') return '';
      return this.convertToUnit(val);
    });

    if (convertedValues.indexOf(false) === -1) {
      ret.push({ key: 'margin', value: convertedValues });
    }
  }

  private parseLineHeight(value: string, ret: any[]): void {
    let parsedValue: any;
    if (typeof value === 'string' && value.slice(-1) === '%') {
      parsedValue = parseFloat(value.slice(0, -1)) / 100;
    } else {
      parsedValue = this.convertToUnit(value);
    }
    ret.push({ key: 'lineHeight', value: parsedValue });
  }

  private parseTextDecoration(value: string, ret: any[]): void {
    value = this.toCamelCase(value);
    if (['underline', 'lineThrough', 'overline'].includes(value)) {
      ret.push({ key: 'decoration', value });
    }
  }

  private parseFontFamily(value: string, ret: any[]): void {
    const fontName = value.split(',')[0]
      .replace(/"|^'|^\s*|\s*$|'$/g, '')
      .replace(/^([a-z])/g, (g) => g[0].toUpperCase())
      .replace(/ ([a-z])/g, (g) => g[1].toUpperCase());
    ret.push({ key: 'font', value: fontName });
  }

  private parseColorStyle(value: string, ret: any[]): void {
    const res = this.parseColor(value);
    ret.push({ key: 'color', value: res.color });
    if (res.opacity < 1) ret.push({ key: 'opacity', value: res.opacity });
  }

  private parseBackgroundColor(value: string, nodeName: string, ret: any[]): void {
    const res = this.parseColor(value);
    if (res.color !== 'transparent') {
      const keyName = (nodeName === 'TD' || nodeName === 'TH') ? 'fillColor' : 'background';
      ret.push({ key: keyName, value: res.color });
      if (res.opacity < 1) {
        const opacityKey = (nodeName === 'TD' || nodeName === 'TH') ? 'fillOpacity' : 'opacity';
        ret.push({ key: opacityKey, value: res.opacity });
      }
    }
  }

  private parseWhiteSpace(value: string, ret: any[]): void {
    if (value === 'nowrap') {
      ret.push({ key: 'noWrap', value: true });
    } else {
      ret.push({ 
        key: 'preserveLeadingSpaces', 
        value: (value === 'break-spaces' || value.slice(0, 3) === 'pre') 
      });
    }
  }

  private parseOtherStyles(key: string, value: string, ignoreProperties: boolean, 
                          nodeName: string, ret: any[]): void {
    if (ignoreProperties && (key.indexOf('margin-') === 0 || key === 'width' || key === 'height')) {
      return;
    }

    if (nodeName === 'IMG' && (key === 'width' || key === 'height')) {
      ret.push({ key, value: this.convertToUnit(value) });
      return;
    }

    if (key.indexOf('padding') === 0) return;
    if (key.indexOf('-') > -1) key = this.toCamelCase(key);
    
    if (value) {
      const parsedValue = this.convertToUnit(value);
      
      if (key === 'fontSize' && parsedValue === false) {
        // Font size keywords converted using ratio: 1px = 0.803571pt
        const fontSizeKeywords: { [key: string]: number } = {
          'xx-small': 5.79,    // 7.2px → 5.79pt
          'x-small': 7.23,     // 9px → 7.23pt
          'small': 8.60,       // 10.7px → 8.60pt
          'medium': 9.64,      // 12px → 9.64pt
          'large': 11.57,      // 14.4px → 11.57pt
          'x-large': 14.46,    // 18px → 14.46pt
          'xx-large': 19.29,   // 24px → 19.29pt
          'xxx-large': 28.93   // 36px → 28.93pt
        };
        if (fontSizeKeywords[value]) {
          ret.push({ key, value: fontSizeKeywords[value] });
        }
        return;
      }

      if (key.indexOf('margin') === 0 && value === 'auto') return;

      ret.push({ key, value: parsedValue === false ? value : parsedValue });
    }
  }

  private processBorders(borders: any[], ret: any[]): void {
    const border: boolean[] = [];
    const borderColor: string[] = [];

    borders.forEach((b: any) => {
      let index = -1;
      if (b.key.indexOf('-left') > -1) index = 0;
      else if (b.key.indexOf('-top') > -1) index = 1;
      else if (b.key.indexOf('-right') > -1) index = 2;
      else if (b.key.indexOf('-bottom') > -1) index = 3;

      const splitKey = b.key.split('-');

      if (splitKey.length === 1 || (splitKey.length === 2 && index >= 0)) {
        b.value = this.borderValueRearrange(b.value);
        const properties = b.value.split(' ');
        const width = parseFloat(properties[0].replace(/(\d*)(\.\d+)?([^\d]+)/g, '$1$2 ').trim());

        if (index > -1) {
          border[index] = (width > 0);
        } else {
          for (let i = 0; i < 4; i++) border[i] = (width > 0);
        }

        if (properties.length > 2) {
          const color = properties.slice(2).join(' ');
          if (index > -1) {
            borderColor[index] = this.parseColor(color).color;
          } else {
            for (let i = 0; i < 4; i++) borderColor[i] = this.parseColor(color).color;
          }
        }
      } else if (index >= 0 && splitKey[2] === 'color') {
        borderColor[index] = this.parseColor(b.value).color;
      } else if (index >= 0 && splitKey[2] === 'width') {
        border[index] = !/^0[a-z%]*$/.test(String(b.value));
      }
    });

    for (let i = 0; i < 4; i++) {
      if (border.length > 0 && typeof border[i] === 'undefined') border[i] = true;
      if (borderColor.length > 0 && typeof borderColor[i] === 'undefined') borderColor[i] = '#000000';
    }

    if (border.length > 0) ret.push({ key: 'border', value: border });
    if (borderColor.length > 0) ret.push({ key: 'borderColor', value: borderColor });
  }

  private borderValueRearrange(styleStr: string): string {
    try {
      const styleArray = styleStr.split(' ');
      if (styleArray.length !== 3) return styleStr;
      
      let v1 = '0px', v2 = 'none', v3 = 'transparent';
      const styles = ['dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset', 'none', 'hidden', 'mix'];
      
      styleArray.forEach((v: string) => {
        if (v.match(/^\d/)) {
          v1 = v;
        } else if (styles.indexOf(v) > -1) {
          v2 = v;
        } else {
          v3 = v;
        }
      });
      
      return v1 + ' ' + v2 + ' ' + v3;
    } catch (e) {
      return styleStr;
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  private parseColor(color: string): { color: string; opacity: number } {
    let opacity = 1;
    const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    const rgbRegex = /^rgba?\(\s*(\d+(\.\d+)?%?),\s*(\d+(\.\d+)?%?),\s*(\d+(\.\d+)?%?)(,\s*\d+(\.\d+)?)?\)$/;
    const nameRegex = /^[a-z]+$/i;

    if (hexRegex.test(color)) {
      return { color, opacity };
    }

    if (rgbRegex.test(color)) {
      const match = rgbRegex.exec(color);
      if (match) {
        const values = match.slice(1).filter((v, i) => i % 2 === 0 && typeof v !== 'undefined');
        const hexValues: string[] = [];
        
        values.forEach((val: string, i: number) => {
          if (i === 3) {
            opacity = parseFloat(val.slice(1));
          } else {
            let decimalValue: number;
            if (val.endsWith('%')) {
              decimalValue = Math.round(parseFloat(val.slice(0, -1)) * 255 / 100);
            } else {
              decimalValue = parseInt(val);
            }
            if (decimalValue > 255) decimalValue = 255;
            const hexString = ('0' + decimalValue.toString(16)).slice(-2);
            hexValues.push(hexString);
          }
        });
        
        return { color: '#' + hexValues.join(''), opacity };
      }
    }

    if (nameRegex.test(color)) {
      return { color, opacity };
    }

    console.error('Could not parse color "' + color + '"');
    return { color, opacity };
  }

  private convertToUnit(val: any): any {
    if (!isNaN(parseFloat(val)) && isFinite(val)) return val * 1;
    
    const mtch = (val + '').trim().match(/^(-?\d*(\.\d+)?)(pt|px|r?em|cm|in)$/);
    if (!mtch) return false;
    
    let value = parseFloat(mtch[1]);
    
    switch (mtch[3]) {
      case 'px':
        // Convert px to pt using ratio: 1px = 0.803571pt (14px = 11.25pt)
        value = parseFloat((value * 0.803571).toFixed(2));
        break;
      case 'em':
      case 'rem':
        value *= 12;
        break;
      case 'cm':
        value = Math.round(value * 28.34646);
        break;
      case 'in':
        value *= 72;
        break;
    }
    
    return value;
  }
}


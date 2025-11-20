import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HtmlToPdfmakeService } from './services/html-to-pdfmake.service';
import { SafePipe } from './safe.pipe';
import { WysiwygEditorComponent } from './wysiwyg-editor/wysiwyg-editor.component';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Set up pdfMake with fonts
(pdfMake as any).vfs = pdfFonts;

// Configure fonts with proper bold/italic variants
(pdfMake as any).fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, SafePipe, WysiwygEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Angular PDF Maker';
  htmlInput: string = `<div>
  <h1>Sample Document</h1>
  <p>This is a <strong>simple</strong> example with <em>formatted</em> text.</p>
  <ul>
    <li>First item</li>
    <li>Second item with <u>underline</u></li>
    <li>Third item</li>
  </ul>
  <table style="width:100%; border: 1px solid black;">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>30</td>
        <td>New York</td>
      </tr>
      <tr>
        <td>Jane Smith</td>
        <td>25</td>
        <td>Los Angeles</td>
      </tr>
    </tbody>
  </table>
  <br>
  <p style="color: blue; font-size: 16px;">This is a blue paragraph with custom font size.</p>
  <a href="https://example.com">Visit our website</a>
</div>`;

  pdfMakeOutput: string = '';
  showOutput: boolean = false;
  pdfDataUrl: string = '';
  showPdfPreview: boolean = true;
  isGeneratingPreview: boolean = false;

  constructor(private htmlToPdfmake: HtmlToPdfmakeService) {
    // Generate initial preview
    this.updatePdfPreview();
  }

  onHtmlChange(): void {
    // Update PDF preview when HTML changes
    this.updatePdfPreview();
  }

  updatePdfPreview(): void {
    if (this.isGeneratingPreview) return;
    
    this.isGeneratingPreview = true;
    
    try {
      const result = this.htmlToPdfmake.convertHtmlToPdfmake(this.htmlInput, {
        tableAutoSize: true,
        removeExtraBlanks: false  // Preserve spacing
      });
      
      const docDefinition: any = {
        content: result.content,
        styles: result.styles,
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        defaultStyle: {
          fontSize: 11.25,  // 14px converted to pt (14 × 0.803571 = 11.25pt)
          lineHeight: 1.5,
          font: 'Roboto'
        }
      };

      // Add images if present
      if (result.images) {
        docDefinition.images = result.images;
      }

      pdfMake.createPdf(docDefinition).getDataUrl((dataUrl: string) => {
        this.pdfDataUrl = dataUrl;
        this.isGeneratingPreview = false;
      });
    } catch (error) {
      console.error('Error generating PDF preview:', error);
      this.isGeneratingPreview = false;
    }
  }

  convertHtml(): void {
    const result = this.htmlToPdfmake.convertHtmlToPdfmake(this.htmlInput, {
      tableAutoSize: true,
      removeExtraBlanks: false  // Preserve spacing
    });
    const docDefinition: any = {
      content: result.content,
      styles: result.styles,
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      defaultStyle: {
        fontSize: 11.25,  // 14px converted to pt (14 × 0.803571 = 11.25pt)
        lineHeight: 1.5,
        font: 'Roboto'
      }
    };
    
    // Add images if present
    if (result.images) {
      docDefinition.images = result.images;
    }
    
    this.pdfMakeOutput = JSON.stringify(docDefinition, null, 2);
    this.showOutput = true;
  }

  generatePdf(): void {
    const result = this.htmlToPdfmake.convertHtmlToPdfmake(this.htmlInput, {
      tableAutoSize: true,
      removeExtraBlanks: false  // Preserve spacing
    });
    
    const docDefinition: any = {
      content: result.content,
      styles: result.styles,
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      defaultStyle: {
        fontSize: 11.25,  // 14px converted to pt (14 × 0.803571 = 11.25pt)
        lineHeight: 1.5,
        font: 'Roboto'
      }
    };

    // Add images if present
    if (result.images) {
      docDefinition.images = result.images;
    }

    pdfMake.createPdf(docDefinition).download('angular-generated.pdf');
  }

  openPdfInNewTab(): void {
    const result = this.htmlToPdfmake.convertHtmlToPdfmake(this.htmlInput, {
      tableAutoSize: true,
      removeExtraBlanks: false  // Preserve spacing
    });
    
    const docDefinition: any = {
      content: result.content,
      styles: result.styles,
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      defaultStyle: {
        fontSize: 11.25,  // 14px converted to pt (14 × 0.803571 = 11.25pt)
        lineHeight: 1.5,
        font: 'Roboto'
      }
    };

    // Add images if present
    if (result.images) {
      docDefinition.images = result.images;
    }

    pdfMake.createPdf(docDefinition).open();
  }

  togglePdfPreview(): void {
    this.showPdfPreview = !this.showPdfPreview;
  }

  onHtmlFromWysiwyg(html: string): void {
    this.htmlInput = html;
    this.updatePdfPreview();
  }

  copyToClipboard(): void {
    if (this.pdfMakeOutput) {
      navigator.clipboard.writeText(this.pdfMakeOutput).then(() => {
        alert('PDFMake JSON copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  }

  resetExample(): void {
    this.htmlInput = `<div>
  <h1>Sample Document</h1>
  <p>This is a <strong>simple</strong> example with <em>formatted</em> text.</p>
  <ul>
    <li>First item</li>
    <li>Second item with <u>underline</u></li>
    <li>Third item</li>
  </ul>
  <table style="width:100%; border: 1px solid black;">
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>City</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>30</td>
        <td>New York</td>
      </tr>
      <tr>
        <td>Jane Smith</td>
        <td>25</td>
        <td>Los Angeles</td>
      </tr>
    </tbody>
  </table>
  <br>
  <p style="color: blue; font-size: 16px;">This is a blue paragraph with custom font size.</p>
  <a href="https://example.com">Visit our website</a>
</div>`;
    this.showOutput = false;
  }
}

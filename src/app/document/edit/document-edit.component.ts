import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ZardPageComponent } from '../../page/page.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZardTextEditorComponent } from '@shared/components/text-editor/text-editor.component';
import { HtmlToPdfmakeService } from '@shared/services/html-to-pdfmake.service';
import { SafePipe } from '@shared/pipes/safe.pipe';
import { ZardPdfViewerComponent } from '@shared/pdf-viewer/pdf-viewer.component';
import { ZardFormFieldComponent } from '@shared/components/form/form.component';
import { ZardFormControlComponent } from '@shared/components/form/form.component';
import { ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ChangeDetectorRef } from '@angular/core';
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
    SafePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-edit.component.html',
})
export class DocumentEditComponent implements OnInit {
  @ViewChild('textEditor') textEditor!: ZardTextEditorComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly htmlToPdfmake = inject(HtmlToPdfmakeService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly documentId = signal<string | null>(null);
  readonly isNew = computed(() => !this.documentId());
  readonly editorContent = signal<string>('');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  
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

  // PDF URL with 50% zoom
  readonly pdfDataUrlWithZoom = computed(() => {
    const url = this.pdfDataUrl();
    if (!url) return '';
    // Add zoom parameter to the PDF URL (50% zoom)
    return url + '#zoom=50';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.documentId.set(id);
    
    if (id) {
      this.loadDocument(id);
    } else {
      // Generate initial preview for new documents
      this.updatePdfPreview();
    }
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
        const result = this.htmlToPdfmake.convertHtmlToPdfmake(htmlContent, {
          tableAutoSize: true,
          removeExtraBlanks: false  // Preserve spacing
        });
        
        const docDefinition: any = {
          content: result.content,
          styles: result.styles,
          pageSize: 'A4',
          pageMargins: [40, 40, 40, 40],
          defaultStyle: {
            fontSize: 9.6,  // Reduced from 12.86pt (16px) to 9.6pt (12px) for smaller fonts
            lineHeight: 1.5,  // Matches text editor line-height: 1.5
            font: 'Roboto'
          }
        };

        // Add images if present
        if (result.images) {
          docDefinition.images = result.images;
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


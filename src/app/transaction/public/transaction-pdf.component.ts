import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PdfGenerationService } from '@shared/services/pdf-generation.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-transaction-pdf',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Generating PDF...</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionPdfComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly pdfGenerationService = inject(PdfGenerationService);

  ngOnInit(): void {
    const transactionId = this.route.snapshot.paramMap.get('id');
    
    if (!transactionId) {
      console.error('Transaction ID is required');
      return;
    }

    this.generateAndServePdf(transactionId);
  }

  private generateAndServePdf(transactionId: string): void {
    const url = `${environment.apiUrl}/public/transactions/${transactionId}/pdf`;
    
    this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error fetching PDF data:', error);
        const errorMessage = error?.error?.message || error?.message || 'Failed to generate PDF';
        alert(errorMessage);
        return of(null);
      })
    ).subscribe((response) => {
      if (!response) {
        return;
      }

      // Handle the response structure - backend returns Result<object>
      let pdfMakeJson: any = null;
      
      if (response && typeof response === 'object') {
        if (response.status === 'Success' && response.data) {
          pdfMakeJson = response.data;
        } else if (response.status === 'Failed') {
          const errorMessage = response.message || 'Failed to generate PDF';
          alert(errorMessage);
          return;
        } else if (response.data !== undefined) {
          pdfMakeJson = response.data;
        } else if (!response.status) {
          pdfMakeJson = response;
        }
      }

      if (!pdfMakeJson) {
        alert('Invalid PDF data received from server');
        return;
      }

      // Convert pdfmake JSON to base64 and copy to clipboard
      try {
        const jsonString = typeof pdfMakeJson === 'string' 
          ? pdfMakeJson 
          : JSON.stringify(pdfMakeJson);
        
        // Convert to base64
        const base64 = btoa(unescape(encodeURIComponent(jsonString)));
        
        // Copy to clipboard
        navigator.clipboard.writeText(base64).then(() => {
          alert('PDFMake JSON (base64) copied to clipboard');
          // Close the window or redirect
          window.close();
        }).catch((error) => {
          console.error('Error copying to clipboard:', error);
          alert('Failed to copy to clipboard. Base64: ' + base64.substring(0, 100) + '...');
        });
      } catch (error) {
        console.error('Error processing PDFMake JSON:', error);
        alert('Failed to process PDFMake JSON');
      }
    });
  }
}


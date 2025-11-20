# Usage Examples - Angular PDF Maker

This document provides detailed examples of how to use the Angular PDF Maker service.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Advanced Examples](#advanced-examples)
3. [Configuration Options](#configuration-options)
4. [Common Use Cases](#common-use-cases)

## Basic Usage

### Example 1: Simple Text Document

```typescript
import { Component } from '@angular/core';
import { HtmlToPdfmakeService } from './services/html-to-pdfmake.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-example',
  template: `<button (click)="generateSimplePdf()">Generate PDF</button>`
})
export class ExampleComponent {
  constructor(private htmlToPdfmake: HtmlToPdfmakeService) {}

  generateSimplePdf() {
    const html = `
      <h1>My Document Title</h1>
      <p>This is a simple paragraph with <strong>bold</strong> text.</p>
      <p>Here's another paragraph with <em>italic</em> text.</p>
    `;

    const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
    const docDefinition = { content: pdfContent };
    
    pdfMake.createPdf(docDefinition).download('simple-document.pdf');
  }
}
```

### Example 2: Document with Lists

```typescript
generateListPdf() {
  const html = `
    <h2>Shopping List</h2>
    <ul>
      <li>Apples</li>
      <li>Bananas</li>
      <li>Oranges</li>
    </ul>
    
    <h2>To-Do List (Priority Order)</h2>
    <ol>
      <li>Complete project report</li>
      <li>Review code changes</li>
      <li>Update documentation</li>
    </ol>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content: pdfContent }).download('lists.pdf');
}
```

### Example 3: Tables

```typescript
generateTablePdf() {
  const html = `
    <h1>Employee Report</h1>
    <table style="width:100%; border: 1px solid black;">
      <thead>
        <tr>
          <th>Name</th>
          <th>Department</th>
          <th>Salary</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>Engineering</td>
          <td>$85,000</td>
        </tr>
        <tr>
          <td>Jane Smith</td>
          <td>Marketing</td>
          <td>$75,000</td>
        </tr>
        <tr>
          <td>Bob Johnson</td>
          <td>Sales</td>
          <td>$70,000</td>
        </tr>
      </tbody>
    </table>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    tableAutoSize: true
  });
  
  pdfMake.createPdf({ content: pdfContent }).download('employee-report.pdf');
}
```

## Advanced Examples

### Example 4: Custom Styling

```typescript
generateStyledPdf() {
  const html = `
    <h1 style="color: #2c3e50; text-align: center;">Annual Report 2024</h1>
    
    <h2 style="color: #3498db;">Executive Summary</h2>
    <p style="text-align: justify; line-height: 1.5;">
      This year has been marked by significant growth and development. 
      Our team has achieved remarkable results across all departments.
    </p>
    
    <h2 style="color: #3498db;">Key Metrics</h2>
    <table style="width:100%; margin-top: 10px;">
      <tr style="background-color: #ecf0f1;">
        <th style="padding: 10px;">Metric</th>
        <th style="padding: 10px;">2023</th>
        <th style="padding: 10px;">2024</th>
        <th style="padding: 10px;">Growth</th>
      </tr>
      <tr>
        <td>Revenue</td>
        <td>$1.5M</td>
        <td>$2.3M</td>
        <td style="color: green;">+53%</td>
      </tr>
      <tr style="background-color: #f8f9fa;">
        <td>Customers</td>
        <td>1,200</td>
        <td>1,850</td>
        <td style="color: green;">+54%</td>
      </tr>
    </table>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    tableAutoSize: true,
    removeExtraBlanks: true
  });

  pdfMake.createPdf({ content: pdfContent }).download('annual-report.pdf');
}
```

### Example 5: Complex Nested Structure

```typescript
generateComplexPdf() {
  const html = `
    <div>
      <h1>Project Documentation</h1>
      
      <h2>1. Overview</h2>
      <p>This project aims to deliver a comprehensive solution for...</p>
      
      <h2>2. Features</h2>
      <ul>
        <li><strong>Feature 1:</strong> Description of feature 1
          <ul>
            <li>Sub-feature 1.1</li>
            <li>Sub-feature 1.2</li>
          </ul>
        </li>
        <li><strong>Feature 2:</strong> Description of feature 2
          <ul>
            <li>Sub-feature 2.1</li>
            <li>Sub-feature 2.2</li>
          </ul>
        </li>
      </ul>
      
      <h2>3. Technical Specifications</h2>
      <table>
        <tr>
          <th>Component</th>
          <th>Technology</th>
          <th>Version</th>
        </tr>
        <tr>
          <td>Frontend</td>
          <td>Angular</td>
          <td>19.x</td>
        </tr>
        <tr>
          <td>Backend</td>
          <td>Node.js</td>
          <td>20.x</td>
        </tr>
      </table>
    </div>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    tableAutoSize: true,
    defaultStyles: {
      h1: { fontSize: 28, bold: true, marginBottom: 10, color: '#2c3e50' },
      h2: { fontSize: 22, bold: true, marginBottom: 8, color: '#34495e' },
      p: { margin: [0, 5, 0, 10], fontSize: 12 }
    }
  });

  pdfMake.createPdf({ content: pdfContent }).download('documentation.pdf');
}
```

### Example 6: Invoice Template

```typescript
generateInvoice() {
  const html = `
    <div style="padding: 20px;">
      <div style="text-align: center;">
        <h1>INVOICE</h1>
        <p>Invoice #: INV-2024-001</p>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      
      <hr>
      
      <div style="margin-top: 20px;">
        <h3>Bill To:</h3>
        <p>
          John Doe<br>
          123 Main Street<br>
          New York, NY 10001
        </p>
      </div>
      
      <div style="margin-top: 20px;">
        <h3>Items:</h3>
        <table style="width: 100%; border: 1px solid black;">
          <thead>
            <tr style="background-color: #3498db; color: white;">
              <th style="padding: 10px;">Description</th>
              <th style="padding: 10px;">Quantity</th>
              <th style="padding: 10px;">Price</th>
              <th style="padding: 10px;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Web Development Services</td>
              <td>40 hours</td>
              <td>$100/hr</td>
              <td>$4,000</td>
            </tr>
            <tr style="background-color: #ecf0f1;">
              <td>Hosting (Annual)</td>
              <td>1 year</td>
              <td>$500</td>
              <td>$500</td>
            </tr>
            <tr>
              <td>Domain Registration</td>
              <td>1 year</td>
              <td>$15</td>
              <td>$15</td>
            </tr>
            <tr style="font-weight: bold; background-color: #95a5a6;">
              <td colspan="3" style="text-align: right; padding: 10px;">TOTAL:</td>
              <td style="padding: 10px;">$4,515</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #7f8c8d;">
        <p>Thank you for your business!</p>
        <p>Payment due within 30 days</p>
      </div>
    </div>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    tableAutoSize: true
  });

  pdfMake.createPdf({ content: pdfContent }).download('invoice.pdf');
}
```

## Configuration Options

### Example 7: Using Default Styles

```typescript
generateWithCustomDefaults() {
  const html = `
    <h1>Custom Styled Document</h1>
    <p>This paragraph uses custom default styles.</p>
    <a href="https://example.com">This link has custom styling</a>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    defaultStyles: {
      h1: { 
        fontSize: 32, 
        bold: true, 
        color: '#e74c3c',
        marginBottom: 15 
      },
      p: { 
        margin: [0, 8, 0, 8],
        fontSize: 13,
        lineHeight: 1.6
      },
      a: { 
        color: '#3498db',
        decoration: 'underline'
      }
    }
  });

  pdfMake.createPdf({ content: pdfContent }).download('custom-styles.pdf');
}
```

### Example 8: Removing Extra Blanks

```typescript
generateCleanPdf() {
  const html = `
    <div>
      <h1>Title</h1>
      
      <p>Paragraph 1</p>
      
      
      <p>Paragraph 2</p>
    </div>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    removeExtraBlanks: true  // This will clean up extra whitespace
  });

  pdfMake.createPdf({ content: pdfContent }).download('clean-document.pdf');
}
```

### Example 9: Opening PDF in New Tab

```typescript
openPdfInBrowser() {
  const html = `
    <h1>View in Browser</h1>
    <p>This PDF will open in a new browser tab instead of downloading.</p>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content: pdfContent }).open();
}
```

### Example 10: Printing PDF Directly

```typescript
printPdf() {
  const html = `
    <h1>Print Document</h1>
    <p>This will open the print dialog.</p>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content: pdfContent }).print();
}
```

## Common Use Cases

### Use Case 1: Form Submission Report

```typescript
generateFormReport(formData: any) {
  const html = `
    <h1>Form Submission Report</h1>
    <p>Submitted on: ${new Date().toLocaleString()}</p>
    
    <h2>User Information</h2>
    <table>
      <tr>
        <td><strong>Name:</strong></td>
        <td>${formData.name}</td>
      </tr>
      <tr>
        <td><strong>Email:</strong></td>
        <td>${formData.email}</td>
      </tr>
      <tr>
        <td><strong>Phone:</strong></td>
        <td>${formData.phone}</td>
      </tr>
    </table>
    
    <h2>Message</h2>
    <p>${formData.message}</p>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content: pdfContent }).download('form-submission.pdf');
}
```

### Use Case 2: Data Export

```typescript
exportDataToPdf(data: any[]) {
  let tableRows = data.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.name}</td>
      <td>${item.status}</td>
      <td>${item.date}</td>
    </tr>
  `).join('');

  const html = `
    <h1>Data Export</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <table style="width:100%;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    tableAutoSize: true
  });

  pdfMake.createPdf({ content: pdfContent }).download('data-export.pdf');
}
```

### Use Case 3: Certificate Generation

```typescript
generateCertificate(name: string, course: string) {
  const html = `
    <div style="text-align: center; padding: 50px;">
      <h1 style="font-size: 36px; color: #2c3e50; margin-bottom: 30px;">
        CERTIFICATE OF COMPLETION
      </h1>
      
      <p style="font-size: 18px; margin: 30px 0;">
        This certifies that
      </p>
      
      <h2 style="font-size: 28px; color: #3498db; margin: 20px 0;">
        ${name}
      </h2>
      
      <p style="font-size: 18px; margin: 30px 0;">
        has successfully completed the course
      </p>
      
      <h3 style="font-size: 24px; color: #2c3e50; margin: 20px 0;">
        "${course}"
      </h3>
      
      <p style="font-size: 16px; margin-top: 50px;">
        Date: ${new Date().toLocaleDateString()}
      </p>
      
      <hr style="width: 200px; margin: 40px auto;">
      
      <p style="font-size: 14px;">
        Director's Signature
      </p>
    </div>
  `;

  const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content: pdfContent }).download(`certificate-${name}.pdf`);
}
```

## Tips and Best Practices

1. **Use Base64 for Images**: When including images, convert them to base64 format for better compatibility
2. **Table Auto-Sizing**: Enable `tableAutoSize: true` when working with tables for better layout
3. **Remove Extra Blanks**: Use `removeExtraBlanks: true` for cleaner output
4. **Custom Styles**: Define `defaultStyles` to maintain consistent styling across your documents
5. **Test HTML First**: Test your HTML in the browser before converting to ensure proper structure

## Troubleshooting

### Issue: PDF not downloading
```typescript
// Make sure pdfMake is properly initialized
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
```

### Issue: Styles not applying
```typescript
// Use inline styles or configure defaultStyles
const options = {
  defaultStyles: {
    h1: { fontSize: 24, bold: true }
  }
};
```

### Issue: Table columns not sizing correctly
```typescript
// Enable table auto-sizing
const options = {
  tableAutoSize: true
};
```

## Conclusion

This service provides a powerful way to convert HTML to PDF in Angular applications. By combining the flexibility of HTML with the power of PDFMake, you can create professional documents programmatically.

For more information, refer to the [README.md](README.md) file or the [PDFMake documentation](https://pdfmake.github.io/docs/).


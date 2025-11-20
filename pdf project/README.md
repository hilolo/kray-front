# Angular PDF Maker

An Angular application that converts HTML to PDF using the `html-to-pdfmake` library and `pdfmake`.

## Overview

This project integrates the `html-to-pdfmake` logic into an Angular application, providing a service-based architecture for converting HTML content to PDF documents.

## Features

- ✅ **HTML to PDFMake Conversion**: Convert HTML markup to PDFMake document definition format
- ✅ **PDF Generation**: Download, open, or print PDFs directly from the browser
- ✅ **Rich HTML Support**: Tables, lists, images, links, and more
- ✅ **Styling Support**: Preserve colors, fonts, margins, and other CSS properties
- ✅ **Table Auto-sizing**: Automatically calculate table column widths
- ✅ **Angular Service Architecture**: Reusable service for easy integration

## Installation

```bash
npm install
```

## Dependencies

- **Angular 19.2.0+**: Modern Angular framework
- **pdfmake**: ^0.2.20 - PDF generation library
- **html-to-pdfmake**: ^2.5.32 - HTML to PDFMake converter

## Usage

### Running the Application

```bash
npm start
```

Navigate to `http://localhost:4200/`

### Using the HtmlToPdfmakeService

The service is located at `src/app/services/html-to-pdfmake.service.ts` and provides a complete implementation of HTML-to-PDFMake conversion logic.

#### Basic Example

```typescript
import { Component } from '@angular/core';
import { HtmlToPdfmakeService } from './services/html-to-pdfmake.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake fonts
(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-example',
  template: `
    <button (click)="generatePdf()">Generate PDF</button>
  `
})
export class ExampleComponent {
  constructor(private htmlToPdfmake: HtmlToPdfmakeService) {}

  generatePdf() {
    const htmlContent = `
      <h1>My Document</h1>
      <p>This is a <strong>sample</strong> document.</p>
    `;

    const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(htmlContent, {
      tableAutoSize: true
    });

    const documentDefinition = {
      content: pdfContent
    };

    pdfMake.createPdf(documentDefinition).download('my-document.pdf');
  }
}
```

### Service Options

The `convertHtmlToPdfmake` method accepts the following options:

```typescript
interface HtmlToPdfMakeOptions {
  defaultStyles?: { [key: string]: any };  // Custom default styles
  tableAutoSize?: boolean;                 // Auto-calculate table widths
  imagesByReference?: boolean;             // Handle images by reference
  removeExtraBlanks?: boolean;             // Remove extra whitespace
  showHidden?: boolean;                    // Show hidden elements
  removeTagClasses?: boolean;              // Don't add html-* classes
  ignoreStyles?: string[];                 // CSS properties to ignore
  fontSizes?: number[];                    // Font size array for <font> tags
  customTag?: (params) => any;             // Custom tag handler
  replaceText?: (text, nodes) => string;   // Text replacement function
}
```

## Supported HTML Elements

### Block Elements
- `<div>`, `<p>`
- `<h1>` to `<h6>`
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`
- `<ul>`, `<ol>`, `<li>`
- `<pre>`

### Inline Elements
- `<span>`, `<strong>`, `<b>`
- `<em>`, `<i>`, `<s>`, `<u>`, `<del>`
- `<a>` (links)
- `<sub>`, `<sup>`
- `<img>`, `<svg>`
- `<br>`, `<hr>`

### Styling Support
- Colors (hex, rgb, rgba, named colors)
- Font families, sizes, weights
- Margins and padding (partial)
- Text alignment
- Borders
- Background colors
- And more...

## Project Structure

```
angular-pdf-maker/
├── src/
│   ├── app/
│   │   ├── services/
│   │   │   └── html-to-pdfmake.service.ts  # Core conversion service
│   │   ├── app.component.ts                 # Main component
│   │   ├── app.component.html               # Template
│   │   └── app.component.css                # Styles
│   ├── index.html
│   └── main.ts
├── package.json
└── README.md
```

## Integration Details

The `html-to-pdfmake` logic has been fully integrated into the Angular application as a service. The service provides:

1. **Complete HTML Parsing**: Uses browser's DOMParser to parse HTML
2. **Style Processing**: Converts CSS styles to PDFMake format
3. **Element Handling**: Specialized handlers for tables, lists, images, etc.
4. **Border Processing**: Full border support with colors and widths
5. **Table Auto-sizing**: Automatic column width calculation
6. **Nested Elements**: Proper handling of nested structures

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run watch
```

### Running tests

```bash
npm test
```

## Migration from html-to-pdfmake

If you were using the standalone `html-to-pdfmake` library, you can now use the Angular service:

**Before:**
```javascript
import htmlToPdfmake from 'html-to-pdfmake';
const content = htmlToPdfmake('<h1>Hello</h1>');
```

**After:**
```typescript
constructor(private htmlToPdfmake: HtmlToPdfmakeService) {}

const content = this.htmlToPdfmake.convertHtmlToPdfmake('<h1>Hello</h1>');
```

## Credits

This project is based on the excellent [html-to-pdfmake](https://github.com/Aymkdn/html-to-pdfmake) library by Aymkdn.

## License

MIT

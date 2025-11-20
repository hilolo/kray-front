# Quick Start Guide - Angular PDF Maker

Get started with Angular PDF Maker in just a few minutes!

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (optional, for development)

## Installation

### Option 1: Use the Existing Project

1. **Navigate to the project directory**
   ```bash
   cd angular-pdf-maker
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200/`

That's it! You should now see the Angular PDF Maker application running.

### Option 2: Add to Existing Angular Project

1. **Copy the service file**
   Copy `src/app/services/html-to-pdfmake.service.ts` to your project

2. **Install pdfmake**
   ```bash
   npm install pdfmake
   npm install --save-dev @types/pdfmake
   ```

3. **Create typings file** (optional but recommended)
   Create `src/typings.d.ts`:
   ```typescript
   declare module 'pdfmake/build/pdfmake' {
     const pdfMake: any;
     export = pdfMake;
   }

   declare module 'pdfmake/build/vfs_fonts' {
     const pdfFonts: any;
     export = pdfFonts;
   }
   ```

4. **Use the service in your component**
   ```typescript
   import { Component } from '@angular/core';
   import { HtmlToPdfmakeService } from './services/html-to-pdfmake.service';
   import * as pdfMake from 'pdfmake/build/pdfmake';
   import * as pdfFonts from 'pdfmake/build/vfs_fonts';

   (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

   @Component({
     selector: 'app-my-component',
     template: `<button (click)="generatePdf()">Generate PDF</button>`
   })
   export class MyComponent {
     constructor(private htmlToPdfmake: HtmlToPdfmakeService) {}

     generatePdf() {
       const html = '<h1>Hello World!</h1><p>This is a test.</p>';
       const pdfContent = this.htmlToPdfmake.convertHtmlToPdfmake(html);
       pdfMake.createPdf({ content: pdfContent }).download('test.pdf');
     }
   }
   ```

## Your First PDF

Let's create your first PDF in just a few lines of code!

### Step 1: Create a Component

```typescript
import { Component } from '@angular/core';
import { HtmlToPdfmakeService } from './services/html-to-pdfmake.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-pdf-demo',
  template: `
    <div class="container">
      <h1>My First PDF</h1>
      <button (click)="createSimplePdf()">Create Simple PDF</button>
      <button (click)="createTablePdf()">Create Table PDF</button>
    </div>
  `
})
export class PdfDemoComponent {
  constructor(private htmlToPdfmake: HtmlToPdfmakeService) {}

  createSimplePdf() {
    const html = `
      <h1>Welcome to PDF Generation!</h1>
      <p>This is a simple example with <strong>bold</strong> and <em>italic</em> text.</p>
      <ul>
        <li>Easy to use</li>
        <li>Powerful features</li>
        <li>Professional results</li>
      </ul>
    `;

    const content = this.htmlToPdfmake.convertHtmlToPdfmake(html);
    pdfMake.createPdf({ content }).download('my-first-pdf.pdf');
  }

  createTablePdf() {
    const html = `
      <h1>Employee List</h1>
      <table style="width:100%; border: 1px solid black;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Position</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>John Doe</td>
            <td>Developer</td>
            <td>IT</td>
          </tr>
          <tr>
            <td>Jane Smith</td>
            <td>Manager</td>
            <td>Sales</td>
          </tr>
        </tbody>
      </table>
    `;

    const content = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
      tableAutoSize: true
    });
    pdfMake.createPdf({ content }).download('employee-list.pdf');
  }
}
```

## Common Tasks

### Generate a PDF from HTML String

```typescript
generatePdf() {
  const html = '<h1>My Document</h1><p>Content here...</p>';
  const content = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content }).download('document.pdf');
}
```

### Open PDF in New Tab (Instead of Downloading)

```typescript
openPdf() {
  const html = '<h1>My Document</h1>';
  const content = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content }).open();
}
```

### Print PDF Directly

```typescript
printPdf() {
  const html = '<h1>My Document</h1>';
  const content = this.htmlToPdfmake.convertHtmlToPdfmake(html);
  pdfMake.createPdf({ content }).print();
}
```

### Generate PDF from Form Data

```typescript
export class FormComponent {
  formData = {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello World'
  };

  constructor(private htmlToPdfmake: HtmlToPdfmakeService) {}

  generateFormPdf() {
    const html = `
      <h1>Form Submission</h1>
      <p><strong>Name:</strong> ${this.formData.name}</p>
      <p><strong>Email:</strong> ${this.formData.email}</p>
      <p><strong>Message:</strong> ${this.formData.message}</p>
    `;

    const content = this.htmlToPdfmake.convertHtmlToPdfmake(html);
    pdfMake.createPdf({ content }).download('form-submission.pdf');
  }
}
```

### Use Custom Styles

```typescript
generateStyledPdf() {
  const html = '<h1>Styled Document</h1><p>With custom colors!</p>';
  
  const content = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
    defaultStyles: {
      h1: { 
        fontSize: 28, 
        bold: true, 
        color: '#3498db',
        marginBottom: 10 
      },
      p: { 
        fontSize: 14,
        lineHeight: 1.5 
      }
    }
  });

  pdfMake.createPdf({ content }).download('styled.pdf');
}
```

## Testing the Application

### Using the Built-in UI

1. Start the development server: `npm start`
2. Open `http://localhost:4200/`
3. You'll see:
   - A text area with sample HTML
   - "Convert to PDFMake" button (shows JSON output)
   - "Download PDF" button (downloads the PDF)
   - "Open PDF in New Tab" button (opens in browser)
   - "Reset Example" button (resets to default HTML)

### Try These Examples

**Example 1: Simple Text**
```html
<h1>Hello World</h1>
<p>This is my first PDF!</p>
```

**Example 2: Formatted Text**
```html
<h1>Formatted Document</h1>
<p>This has <strong>bold</strong>, <em>italic</em>, and <u>underlined</u> text.</p>
```

**Example 3: Lists**
```html
<h2>Shopping List</h2>
<ul>
  <li>Apples</li>
  <li>Bananas</li>
  <li>Oranges</li>
</ul>
```

**Example 4: Table**
```html
<table style="width:100%">
  <tr>
    <th>Product</th>
    <th>Price</th>
  </tr>
  <tr>
    <td>Apple</td>
    <td>$1.00</td>
  </tr>
</table>
```

## Troubleshooting

### Issue: PDF not downloading

**Solution:** Make sure pdfMake is properly initialized:
```typescript
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
```

### Issue: TypeScript errors on pdfMake import

**Solution:** Create a `src/typings.d.ts` file with the type declarations (see Option 2 above)

### Issue: Service not found

**Solution:** Make sure the service is provided in root:
```typescript
@Injectable({
  providedIn: 'root'  // This makes it available everywhere
})
export class HtmlToPdfmakeService { }
```

### Issue: Styles not applying

**Solution:** Use inline styles or configure defaultStyles:
```typescript
const content = this.htmlToPdfmake.convertHtmlToPdfmake(html, {
  defaultStyles: {
    h1: { fontSize: 24, bold: true, color: '#333' }
  }
});
```

## Next Steps

1. ✅ Read the [README.md](README.md) for detailed information
2. ✅ Check out [USAGE-EXAMPLES.md](USAGE-EXAMPLES.md) for more examples
3. ✅ Review [COMPARISON.md](COMPARISON.md) to understand differences from html-to-pdfmake
4. ✅ Explore the [PDFMake documentation](https://pdfmake.github.io/docs/) for advanced features

## Build for Production

When you're ready to deploy:

```bash
# Build the project
ng build --configuration production

# Output will be in dist/angular-pdf-maker
# Deploy the contents to your web server
```

## Support

- 📖 Documentation: See README.md and USAGE-EXAMPLES.md
- 🐛 Issues: Report bugs on GitHub
- 💬 Questions: Open a discussion on GitHub

## Summary

You've learned how to:
- ✅ Install and run Angular PDF Maker
- ✅ Create your first PDF
- ✅ Use the service in your components
- ✅ Apply custom styles
- ✅ Handle common use cases

Happy PDF generating! 🎉


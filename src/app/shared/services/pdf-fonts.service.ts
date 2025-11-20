import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

/**
 * Service to manage custom fonts for pdfMake
 * To add Arial fonts:
 * 1. Get Arial font files (TTF format): Arial.ttf, Arial-Bold.ttf, Arial-Italic.ttf, Arial-BoldItalic.ttf
 * 2. Convert them to base64 (use online tools or Node.js)
 * 3. Import the base64 strings and add them to the VFS
 */

@Injectable({
  providedIn: 'root'
})
export class PdfFontsService {
  private initialized = false;

  constructor() {
    this.initializeFonts();
  }

  private initializeFonts(): void {
    if (this.initialized) return;

    // Set up pdfMake with default fonts
    (pdfMake as any).vfs = pdfFonts;

    // Initialize with Roboto as fallback
    (pdfMake as any).fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    this.initialized = true;
  }

  /**
   * Add Arial fonts to pdfMake VFS
   * @param fonts Object containing base64 encoded font files
   * Example:
   * {
   *   normal: 'base64-encoded-arial.ttf',
   *   bold: 'base64-encoded-arial-bold.ttf',
   *   italics: 'base64-encoded-arial-italic.ttf',
   *   bolditalics: 'base64-encoded-arial-bold-italic.ttf'
   * }
   */
  addArialFonts(fonts: {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }): void {
    // Add font files to VFS
    (pdfMake as any).vfs['Arial.ttf'] = fonts.normal;
    (pdfMake as any).vfs['Arial-Bold.ttf'] = fonts.bold;
    (pdfMake as any).vfs['Arial-Italic.ttf'] = fonts.italics;
    (pdfMake as any).vfs['Arial-BoldItalic.ttf'] = fonts.bolditalics;

    // Register Arial font
    (pdfMake as any).fonts = {
      ...(pdfMake as any).fonts,
      Arial: {
        normal: 'Arial.ttf',
        bold: 'Arial-Bold.ttf',
        italics: 'Arial-Italic.ttf',
        bolditalics: 'Arial-BoldItalic.ttf'
      }
    };
  }

  /**
   * Set Arial as the default font (must be added first using addArialFonts)
   */
  setArialAsDefault(): void {
    if (!(pdfMake as any).fonts?.Arial) {
      console.warn('Arial fonts not found. Please add them first using addArialFonts()');
      return;
    }
    // Arial will be used when specified in document definition
  }
}


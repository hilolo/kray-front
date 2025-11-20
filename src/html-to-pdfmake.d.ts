declare module 'html-to-pdfmake' {
  interface HtmlToPdfMakeOptions {
    tableAutoSize?: boolean;
    removeExtraBlanks?: boolean;
    [key: string]: any;
  }

  interface HtmlToPdfMakeResult {
    content?: any;
    images?: { [key: string]: string };
    [key: string]: any;
  }

  function htmlToPdfMake(
    html: string,
    options?: HtmlToPdfMakeOptions
  ): HtmlToPdfMakeResult | any;

  export default htmlToPdfMake;
}


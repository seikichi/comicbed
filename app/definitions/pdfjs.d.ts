/// <reference path="./DefinitelyTyped/jquery/jquery.d.ts" />

declare module PDFJS {
  var workerSrc: string;
  var disableWorker: boolean;
  var disableAutoFetch: boolean;
  var disableRange: boolean;

  interface GetDocumentOptions {
    url?: string;
    httpHeaders?: string;
  }

  function getDocument(options?: GetDocumentOptions): JQueryPromise<PDFDocument>;


  interface PDFDocument {
    numPages: number;
    getPage(pageNum: number): JQueryPromise<PDFPageProxy>;
  }

  interface RenderContext {
    canvasContext: CanvasRenderingContext2D;
    viewport: PageViewport;
  }

  interface PageViewport {
    width: number;
    height: number;
  }

  interface PDFPageProxy {
    getViewport(scale: number, rotate?: number): PageViewport;
    render(context: RenderContext): JQueryPromise<void>;
  }
}

declare module "pdfjs" {
  export = PDFJS;
}

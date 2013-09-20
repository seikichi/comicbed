/// <reference path="./DefinitelyTyped/jquery/jquery.d.ts" />

declare module PDFJS {
  var workerSrc: string;
  var disableWorker: boolean;
  var disableAutoFetch: boolean;
  var disableRange: boolean;

  interface GetDocumentOptions {
    url?: string;
    data?: ArrayBuffer;
    httpHeaders?: string;
    password?: string;
  }

  interface Promise<T> {
    isResolved: boolean;
    isRejected: boolean;
    resolve(value: T): void;
    reject(reason: string): void;
    then<U>(onResolve: (value :T) => U, onReject?: (reason: any) => U): Promise<U>;
  }

  interface RenderTask extends Promise<void> {
    cancel(): void;
  }

  function getDocument(options?: GetDocumentOptions): Promise<PDFDocumentProxy>;

  interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNum: number): Promise<PDFPageProxy>;
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
    pageNumber: number;
    getViewport(scale: number, rotate?: number): PageViewport;
    render(context: RenderContext): RenderContext;
  }
}

declare module "pdfjs" {
  export = PDFJS;
}

/// <reference path="./DefinitelyTyped/jquery/jquery.d.ts" />

declare module PDFJS {
  var version: string;
  var build: string;

  var workerSrc: string;
  var disableWorker: boolean;
  var disableAutoFetch: boolean;
  var disableRange: boolean;
  var maxImageSize: number;
  var disableFontFace: boolean;
  var enableStats: boolean;
  var pdfBug: boolean;

  interface GetDocumentOptions {
    url?: string;
    data?: ArrayBuffer;
    httpHeaders?: {[key:string]:string;};
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
    destroy(): void;
  }

  interface RenderContext {
    canvasContext: CanvasRenderingContext2D;
    viewport: PageViewport;
  }

  interface PageViewport {
    width: number;
    height: number;
  }

  interface PDFObjects {
    objs: {[objId:string]:any;};
    get(objId: string, callback?: (data: any) => void): any;
    hasData(objId: string): boolean;
    getData(objId: string): any;
  }

  interface PDFPageProxy {
    pageNumber: number;
    objs: PDFObjects;
    pageInfo: { pageIndex: number; rotate: number; }
    view: number[];
    getViewport(scale: number, rotate?: number): PageViewport;
    render(context: RenderContext): RenderContext;
    destroy(): void;
  }
}

declare module "pdfjs" {
  export = PDFJS;
}

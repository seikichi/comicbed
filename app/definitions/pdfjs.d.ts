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

    function getDocument(options?: GetDocumentOptions): JQueryDeferred<PdfDocument>;


    class PdfDocument {
        numPages: number;
        getPage(pageNum: number): JQueryDeferred<PdfPage>;
    }

    interface RenderContext {
        canvasContext: CanvasRenderingContext2D;
        viewport: ViewPort;
    }

    interface ViewPort {
        width: number;
        height: number;
    }

    class PdfPage {
        getViewport(scale: number): ViewPort;
        render(context: RenderContext): void;
    }
}

declare module "pdfjs" {
    export = PDFJS;
}

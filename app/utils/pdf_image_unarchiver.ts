import Unarchiver = require('utils/unarchiver');
import PDFJS = require('pdfjs');
import sprintf = require('sprintf');
import ImageUtil = require('utils/image');

// TODO(seikichi): move to unarchiver.setting
PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
PDFJS.disableWorker = false;
PDFJS.disableAutoFetch = true;
PDFJS.disableRange = false;

export = PdfImageUnarchiver;

class PdfImageUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string) : JQueryPromise<Unarchiver.Unarchiver> {
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    PDFJS.getDocument({url: url}).then((document: PDFJS.PDFDocumentProxy) => {
      deferred.resolve(new PdfImageUnarchiver(document));
    }, () => {
      deferred.reject();
    });
    return deferred.promise();
  }

  private _archiveName: string;
  private _document: PDFJS.PDFDocumentProxy;
  private _names: string[];
  private _nameToPageNum: {[name: string]: number;};

  constructor(document: PDFJS.PDFDocumentProxy) {
    this._document = document;
    this._archiveName = (<any>this._document).pdfInfo.info.Title;
    this._names = [];
    this._nameToPageNum = {};

    var numOfDigits = 1 + Math.floor(Math.log(this._document.numPages) / Math.log(10));
    var pageNameformat = sprintf('pdf-page-%%0%dd', numOfDigits);
    for (var i = 0, len = this._document.numPages; i < len; ++i) {
      var pageName = sprintf(pageNameformat, i + 1);
      this._names.push(pageName);
      this._nameToPageNum[pageName] = i + 1;
    }
  }
  archiveName(): string {
    return this._archiveName;
  }
  filenames(): string[] {
    return this._names;
  }
  unpack(name: string): JQueryPromise<Unarchiver.Content> {
    var pageNum = this._nameToPageNum[name];
    var deferred = $.Deferred<Unarchiver.Content>();

    var canvas = document.createElement('canvas');
    var page: PDFJS.PDFPageProxy = null;
    this._document.getPage(pageNum).then((_page: PDFJS.PDFPageProxy) => {
      page = _page;
      var viewport = page.getViewport(0);
      var context = canvas.getContext('2d');
      var renderContext = { canvasContext: context, viewport: viewport, };
      return page.render(renderContext);
    }).then(() => {
      var objs = page.objs.objs;
      for (var key in objs) if (objs.hasOwnProperty(key)) {
        if (key.indexOf('img_') !== 0) { continue; }
        var data: any = page.objs.getData(key)

        if (!('data' in data)) {
          deferred.resolve(<HTMLElement>data);
        } else {
          ImageUtil.pixelDataToImageElement(data.data, data.width, data.height)
            .then((image: HTMLImageElement) => {
              deferred.resolve(image);
            }).fail(() => {
              deferred.reject();
            });
        }
        return;
      }
      deferred.reject();
    });
    return deferred.promise();
  }
  close(): void {
    this._document.destroy();
  }
}

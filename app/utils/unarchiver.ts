import $ = require('jquery');

// public
export = Unarchiver;

module Unarchiver {
  export interface Unarchiver {
    filenames(): string[];
    unpack(name: string): JQueryPromise<Content>;
    close(): void;
  }
  export interface Content extends HTMLElement {}
  export interface Options {
    mimeType?: string;
  }
  export interface Setting {
    loadImageXObjectOnlyInPdf?: boolean;
  }

  export interface Factory {
    getUnarchiverFromURL(url: string,
                         setting?: Setting,
                         options?: Options): JQueryPromise<Unarchiver>;
    // getUnarchiverFromFile(file: File): void;
  }

  export function createFactory(): Factory {
    return new FactoryImpl();
  }
}

// private
enum FileType { Pdf, Other };

class FactoryImpl implements Unarchiver.Factory {
  getUnarchiverFromURL(url: string,
                       setting: Unarchiver.Setting = {},
                       options: Unarchiver.Options = {})
  : JQueryPromise<Unarchiver.Unarchiver> {
    var fileType = FileType.Other;
    if ('mimeType' in options) {
      switch (options.mimeType) {
      case 'application/pdf':
        fileType = FileType.Pdf;
        break;
      default:
        break;
      }
    }
    if (fileType === FileType.Other) {
      var extension = url.split('?').shift().split('.').pop();
      switch (extension) {
      case 'pdf':
        fileType = FileType.Pdf;
        break;
      default:
        break;
      }
    }

    // load specific unarchiver module dynamically
    var deferred = $.Deferred();
    if (fileType === FileType.Pdf) {
      require(['utils/pdf_image_unarchiver'], (PdfImageUnarchiver: typeof PdfImageUnarchiver) => {
        PdfImageUnarchiver.createFromURL(url).then((unarchiver: typeof PdfImageUnarchiver) => {
          deferred.resolve(unarchiver);
        }).fail(() => {
          deferred.reject();
        });
      });  // TODO(seikichi): error handling
    } else {
      deferred.reject();
    }
    return deferred.promise();
  }
  // getUnarchiverFromFile(file: File): void;
}
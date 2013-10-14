import $ = require('jquery');
import Events = require('events');

// public
export = Unarchiver;

module Unarchiver {
  export interface Unarchiver {
    archiveName(): string;
    filenames(): string[];
    unpack(name: string): JQueryPromise<Content>;
    close(): void;
  }
  export interface Content extends HTMLElement {
    width: number;
    height: number;
  }

  export interface Options {
    mimeType?: string;
  }

  export interface Setting extends Events.Events {
    pdfjsCanvasScale(): number;
    detectsImageXObjectPageInPdf(): boolean;
    pageFileExtensions(): string[];
  }

  export interface Factory {
    getUnarchiverFromURL(url: string,
                         options?: Options): JQueryPromise<Unarchiver>;
    getUnarchiverFromFile(file: File): JQueryPromise<Unarchiver>;
  }

  export function createFactory(setting: Setting): Factory {
    return new FactoryImpl(setting);
  }
}

// private
enum FileType { Pdf, Zip, Rar, Other };

class FactoryImpl implements Unarchiver.Factory {
  constructor(private _setting: Unarchiver.Setting) {}

  getUnarchiverFromFile(file: File) : JQueryPromise<Unarchiver.Unarchiver> {
    var url: string = (<any>window).URL.createObjectURL(file);
    var options = {
      mimeType: file.type
    };
    return this.getUnarchiverFromURL(url, options);
  }

  getUnarchiverFromURL(url: string,
                       options: Unarchiver.Options = {})
  : JQueryPromise<Unarchiver.Unarchiver> {
    // detects archive filetype
    var fileType = FileType.Other;
    if ('mimeType' in options) {
      switch (options.mimeType) {
      case 'application/pdf':
        fileType = FileType.Pdf;
        break;
      case 'application/zip':
        fileType = FileType.Zip;
        break;
      case 'application/rar':
      case 'application/x-rar':
      case 'application/x-rar-compressed':
        fileType = FileType.Rar;
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
      case 'zip':
      case 'cbz':
        fileType = FileType.Zip;
        break;
      case 'rar':
      case 'cbr':
        fileType = FileType.Rar;
        break;
      default:
        break;
      }
    }

    // load specific unarchiver module dynamically
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    var moduleName = '';
    switch (fileType) {
    case FileType.Pdf:
      var moduleName = 'models/pdf_unarchiver';
      break;
    case FileType.Zip:
      var moduleName = 'models/zip_unarchiver';
      break;
    case FileType.Rar:
      var moduleName = 'models/rar_unarchiver';
      break;
    default:
      return deferred.reject().promise();
      break;
    }

    require([moduleName], (factory: {
      createFromURL: (url: string, setting: Unarchiver.Setting)
        => JQueryPromise<Unarchiver.Unarchiver>;
    }) => {
      factory.createFromURL(url, this._setting)
        .then((unarchiver: Unarchiver.Unarchiver) => {
          deferred.resolve(unarchiver);
        }).fail(() => {
          deferred.reject();
        });
    });

    return deferred.promise();
  }
}

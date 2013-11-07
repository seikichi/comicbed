import Promise = require('promise');
import PromiseUtil = require('utils/promise');
import Events = require('events');
import Progress = require('models/progress');

// public
export = Unarchiver;

module Unarchiver {
  export interface Unarchiver {
    archiveName(): string;
    filenames(): string[];
    unpack(name: string): Promise<Content>;
    close(): void;
  }
  export interface Content extends HTMLElement {
    width: number;
    height: number;
  }

  export interface Options {
    name?: string;
    mimeType?: string;
    httpHeaders?: {[key: string]:string};
    bytes?: number;
    isGoogleDrive?: number;
  }

  export interface Setting extends Events.Events {
    pdfjsCanvasScale(): number;
    detectsImageXObjectPageInPdf(): boolean;
    enablesRangeRequestInPdf(): boolean;
    pageFileExtensions(): string[];
  }

  export interface Factory {
    getUnarchiverFromURL(url: string,
                         options?: Options): Promise<Unarchiver>;
    getUnarchiverFromFile(file: File): Promise<Unarchiver>;
  }

  export function createFactory(setting: Setting): Factory {
    return new FactoryImpl(setting);
  }
}

// private
enum FileType { Pdf, Zip, Rar, Other };

interface UnarchiverModule {
  createFromURL(url: string,
                setting: Unarchiver.Setting,
                options: Unarchiver.Options): Promise<Unarchiver.Unarchiver>;
}

class FactoryImpl implements Unarchiver.Factory {
  constructor(private _setting: Unarchiver.Setting) {}

  getUnarchiverFromFile(file: File) : Promise<Unarchiver.Unarchiver> {
    var url: string = (<any>window).URL.createObjectURL(file);
    var options = {
      mimeType: file.type
    };
    return this.getUnarchiverFromURL(url, options);
  }

  getUnarchiverFromURL(url: string, options: Unarchiver.Options = {})
  : Promise<Unarchiver.Unarchiver> {
     // detects archive filetype
    var fileType = FileType.Other;
    if ('mimeType' in options) {
      switch (options.mimeType) {
      case 'application/pdf':
        fileType = FileType.Pdf;
        break;
      case 'application/zip':
      case 'application/x-zip':
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
      if (options.name) {
        extension = options.name.split('?').shift().split('.').pop();
      }
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
      var name = options.name ? options.name : url;
      return Promise.rejected({ message: 'Unsupported File Format: ' + name});
      break;
    }

    return PromiseUtil.require<UnarchiverModule>(moduleName)
      .then((factory: UnarchiverModule) => {
        return factory.createFromURL(url, this._setting, options);
      });
  }
}

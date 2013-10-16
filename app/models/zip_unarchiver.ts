import Promise = require('promise');
import PromiseUtil = require('utils/promise');
import Unarchiver = require('models/unarchiver');
import jz = require('jsziptools');
import ImageUtil = require('utils/image');

export = ZipUnarchiver;

class ZipUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting, options: Unarchiver.Options)
  : Promise<Unarchiver.Unarchiver> {
    var name = '';
    if ('name' in options) {
      name = options.name;
    } else {
      name = url.split(/(\#|\?)/).shift().split('/').pop();
    }

    return PromiseUtil.getArrayBufferByXHR(url).then((buffer: ArrayBuffer) => {
      return Promise.cast<jz.zip.ZipArchiveReader>(jz.zip.unpack({buffer: buffer}))
    }).then((reader: jz.zip.ZipArchiveReader) => {
      return new ZipUnarchiver(name, reader, setting);
    });
  }

  private _filenames: string[];
  constructor(private _name: string,
              private _reader: jz.zip.ZipArchiveReader,
              private _setting: Unarchiver.Setting) {
    this._filenames = [];
    var filenames = this._reader.getFileNames();
    var extensions = this._setting.pageFileExtensions();
    for (var i = 0, len = filenames.length; i < len; ++i) {
      if (extensions.indexOf(filenames[i].split('.').pop()) !== -1) {
        this._filenames.push(filenames[i]);
      }
    }
  }

  archiveName(): string { return this._name; }
  filenames(): string[] { return this._filenames; }
  unpack(name: string): JQueryPromise<Unarchiver.Content> {
    var deferred = $.Deferred<Unarchiver.Content>();
    this._reader.getFileAsBlob(name).done((blob: Blob) => {
      var fileReader = new FileReader();
      fileReader.onload = () => {
        var buffer: ArrayBuffer = fileReader.result;
        ImageUtil.createImageElementFromArrayBuffer(buffer)
          .then((image: HTMLImageElement) => {
            deferred.resolve(image);
          }).fail(() => {
            deferred.reject();
          });
      }
      fileReader.readAsArrayBuffer(blob);
    }).fail(() => {
      deferred.reject();
    });
    return deferred.promise();
  }
  close(): void { this._reader = null; }
}

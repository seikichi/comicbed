import Unarchiver = require('models/unarchiver');
import jz = require('jsziptools');
import ImageUtil = require('utils/image');
import Task = require('models/task');

export = ZipUnarchiver;

class ZipUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting)
  : Task<Unarchiver.Unarchiver> {
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (e: Event) => {
      if (xhr.status !== 200) { deferred.reject(); return; }
      var buffer: ArrayBuffer = xhr.response;
      jz.zip.unpack({buffer: buffer}).done((reader: jz.zip.ZipArchiveReader) => {
        deferred.resolve(new ZipUnarchiver(reader, setting));
      }).fail(() => {
        deferred.reject();
      });
      xhr = null;
    };
    xhr.send();
    var task = new Task(deferred.promise());
    task.oncancel = () => { deferred.reject(); xhr.abort(); };
    return task;
  }

  private _filenames: string[];
  constructor(private _reader: jz.zip.ZipArchiveReader,
              private _setting: Unarchiver.Setting) {
    this._filenames = this._reader.getFileNames();
  }

  archiveName(): string { return 'ZIP archive'; } // TODO(seikichi): fix
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

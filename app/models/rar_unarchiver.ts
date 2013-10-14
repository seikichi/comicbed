import Unarchiver = require('models/unarchiver');
import Unrar = require('unrar');
import ImageUtil = require('utils/image');
import Task = require('models/task');

export = RarUnarchiver;

class RarUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting)
  : Task<Unarchiver.Unarchiver> {
    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (e: Event) => {
      if (xhr.status !== 200) {
        console.log('xhr error');
        deferred.reject();
        return;
      }
      var buffer: ArrayBuffer = xhr.response;
      deferred.resolve(new RarUnarchiver(new Unrar(buffer), setting));
      xhr = null;
    };
    xhr.onprogress = (ev: ProgressEvent) => {
      if (ev.lengthComputable) {
        var progress = Math.round((ev.loaded / ev.total) * 100);
        deferred.notify({ message: 'downloading ...', progress: progress });
      }
    };
    xhr.send();
    var task = new Task(deferred.promise());
    task.oncancel = () => {
      console.log('RAR unarchiver canceled');
      deferred.reject();
      if (xhr !== null) { xhr.abort(); }
    };
    return task;
  }

  private _filenames: string[];
  constructor(private _unrar: Unrar,
              private _setting: Unarchiver.Setting) {
    this._filenames = this._unrar.getFilenames();
  }

  archiveName(): string { return 'RAR archive'; } // TODO(seikichi): fix
  filenames(): string[] { return this._filenames; }
  unpack(name: string): JQueryPromise<Unarchiver.Content> {
    var data = this._unrar.decompress(name);
    return ImageUtil.createImageElementFromArrayBuffer(data);
  }
  close(): void { this._unrar.close(); }
}

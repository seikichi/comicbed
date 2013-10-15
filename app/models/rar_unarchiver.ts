import Unarchiver = require('models/unarchiver');
import Unrar = require('unrar');
import ImageUtil = require('utils/image');
import Task = require('models/task');

export = RarUnarchiver;

class RarUnarchiver implements Unarchiver.Unarchiver {

  static createFromURL(url: string, setting: Unarchiver.Setting, options: Unarchiver.Options)
  : Task<Unarchiver.Unarchiver> {
    var name = '';
    if ('name' in options) {
      name = options.name;
    } else {
      name = url.split(/(\#|\?)/).shift().split('/').pop();
    }

    var deferred = $.Deferred<Unarchiver.Unarchiver>();
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = (e: Event) => {
      var buffer: ArrayBuffer = xhr.response;
      deferred.resolve(new RarUnarchiver(name, new Unrar(buffer), setting));
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
      deferred.reject();
      if (xhr !== null) { xhr.abort(); }
    };
    return task;
  }

  private _filenames: string[];
  constructor(private _name: string,
              private _unrar: Unrar,
              private _setting: Unarchiver.Setting) {
    this._filenames = [];
    var filenames = this._unrar.getFilenames();
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
    var data = this._unrar.decompress(name);
    return ImageUtil.createImageElementFromArrayBuffer(data);
  }
  close(): void { this._unrar.close(); }
}

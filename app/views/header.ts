import Backbone = require('backbone');
import BaseView = require('views/composite');
import CompositeView = require('views/composite');
import Reader = require('models/reader');
import templates = require('templates');
import DropboxStorage = require('utils/dropbox');
import GoogoleDriveStorage = require('utils/gdrive');
import Picker = require('utils/picker');

export = HeaderView;

class HeaderView extends CompositeView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;

  private _options: HeaderView.Options;
  events: {[event:string]:string;};

  constructor(options: HeaderView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._template = options.template;
    super(options);
  }

  show() {
    this.$('#header-content-wrapper').slideDown();
  }
  hide() {
    this.$('#header-content-wrapper').slideUp();
  }

  initialize() {
    this.assign('#header-content', new HeaderContentView({
      reader: this._reader,
      template: templates.headercontent,
    }));
  }

  presenter() {
    return this._template({});
  }
}

module HeaderView {
  export interface Options extends Backbone.ViewOptions {
    reader: Reader.Reader;
    template: HTMLTemplate;
  }
}

class HeaderContentView extends BaseView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;

  events: {[event:string]:string;};

  constructor(options: HeaderView.Options) {
    this._reader = options.reader;
    this._template = options.template;
    this.events = {
      'click #local-file-button': 'onLocalFileButton',
      'change #local-file-button': 'onLocalFileButton',
      'click #google-drive-button': 'onGDriveButton',
      'click #dropbox-button': 'onDropboxButton',
      'click #close-button': 'onCloseButton',
    };
    super(options);
  }

  onLocalFileButton(jqEvent: any) {
    var event = jqEvent.originalEvent;
    var files = event.target.files;
    if (files.length !== 0) {
      this._reader.openFile(files[0])
    }
  }

  onDropboxButton() {
    DropboxStorage
      .createPicker()
      .pick()
      .then((result: Picker.Result) => {
        this._reader.openURL(result.url, {
          name: result.name
        });
      });
  }

  onGDriveButton() {
    GoogoleDriveStorage
      .createPicker()
      .pick()
      .then((result: Picker.Result) => {
        this._reader.openURL(result.url, {
          name: result.name,
          mimeType: result.mimeType,
          httpHeaders: result.httpHeaders,
        });
      });
  }

  onCloseButton() {
    this._reader.close();
  }

  presenter() {
    return this._template({});
  }
}

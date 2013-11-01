// import BaseView = require('views/composite');
// import CompositeView = require('views/composite');
// import templates = require('templates');
// import DropboxStorage = require('utils/dropbox');
// import GoogoleDriveStorage = require('utils/gdrive');
// import Picker = require('utils/picker');

import Backbone = require('backbone');
import Reader = require('models/reader');
import BaseView = require('views/base');

export = HeaderView;

class HeaderView extends BaseView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;

  private _options: HeaderView.Options;
  events: {[event:string]:string;};

  constructor(options: HeaderView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._template = options.template;
    this.events = {
      'click #info-button': 'onClickInfo',
      'click #close-button': 'onClickClose',
    };
    super(options);
  }

  initialize() {
    // this.listenTo(this._reader, 'change', () => { this.render(); });
    this.listenTo(this._reader, 'change', () => {
      this.$('.title').html(this._reader.title());
    });
  }

  presenter() {
    return this._template({
      title: this._reader.title()
    });
  }

  onClickInfo() {}

  onClickClose() {
    this._reader.close();
  }
}

module HeaderView {
  export interface Options extends Backbone.ViewOptions {
    reader: Reader.Reader;
    template: HTMLTemplate;
  }
}
//   private _reader: Reader.Reader;
//   private _template: HTMLTemplate;

//   private _options: HeaderView.Options;
//   events: {[event:string]:string;};

//   constructor(options: HeaderView.Options) {
//     this._options = options;
//     this._reader = options.reader;
//     this._template = options.template;
//     super(options);
//   }

//   show() {
//     this.$('#header-content-wrapper').slideDown();
//   }
//   hide() {
//     this.$('#header-content-wrapper').slideUp();
//   }

//   initialize() {
//     this.assign('#header-content', new HeaderContentView({
//       reader: this._reader,
//       template: templates.headercontent,
//     }));
//   }

//   presenter() {
//     return this._template({});
//   }
// }

// module HeaderView {
//   export interface Options extends Backbone.ViewOptions {
//     reader: Reader.Reader;
//     template: HTMLTemplate;
//   }
// }

// class HeaderContentView extends BaseView {
//   private _reader: Reader.Reader;
//   private _template: HTMLTemplate;

//   events: {[event:string]:string;};

//   constructor(options: HeaderView.Options) {
//     this._reader = options.reader;
//     this._template = options.template;
//     this.events = {
//       'click #local-file-button': 'onLocalFileButton',
//       'change #local-file-button': 'onLocalFileButton',
//       'click #google-drive-button': 'onGDriveButton',
//       'click #dropbox-button': 'onDropboxButton',
//       'click #close-button': 'onCloseButton',
//     };
//     super(options);
//   }

//   onLocalFileButton(jqEvent: any) {
//     var event = jqEvent.originalEvent;
//     var files = event.target.files;
//     if (files.length !== 0) {
//       this._reader.openFile(files[0])
//     }
//   }

//   onDropboxButton() {
//     DropboxStorage
//       .createPicker()
//       .pick()
//       .then((result: Picker.Result) => {
//         this._reader.openURL(result.url, result);
//       });
//   }

//   onGDriveButton() {
//     GoogoleDriveStorage
//       .createPicker()
//       .pick()
//       .then((result: Picker.Result) => {
//         this._reader.openURL(result.url, result);
//       });
//   }

//   onCloseButton() {
//     this._reader.close();
//   }

//   presenter() {
//     return this._template({});
//   }
// }

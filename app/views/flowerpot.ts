import $ = require('jquery');
import Factory = require('models/factory');
import Reader = require('models/reader');
import Setting = require('models/setting');
import CompositeView = require('views/composite');
import ScreenCollectionView = require('views/screens');
import ModalView = require('views/modal');
import ProgressView = require('views/progress');
import HeaderView = require('views/header');
import FooterView = require('views/footer');

import templates = require('templates');
import strings = require('utils/strings');

export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private _template: HTMLTemplate;
  private _queryOptions: {[field:string]:string;};

  private _reader: Reader.Reader;
  private _setting: Setting.Setting;

  events: {[event:string]: any};

  constructor(template: HTMLTemplate,
              options: {[field:string]:string;}) {
    this._template = template;
    this._queryOptions = options;

    this.attributes = {'data-role': 'page'};
    this.id = 'flowerpot';

    this.events = {
      'drop': 'onDrop',
      'dragover': 'onDragOver',
      'mouseleave #menu-remove-area': 'onEnterMenu',
      'mouseenter #menu-remove-area': 'onLeaveMenu',
    };
    super({});
  }

  initialize(): void {
    this._setting = Factory.createSetting(this._queryOptions);
    this._reader = Factory.createReader({
      width: this.$el.width(),
      height: this.$el.height()
    }, this._setting);

    this.assign('#header', new HeaderView({
      template: templates.header,
      reader: this._reader,
    }));

    this.assign('#footer', new FooterView({
      template: templates.footer,
      reader: this._reader,
      setting: this._setting.screenSetting(),
    }));

    // Note: for debug
    (<any>window).reader = this._reader;

    this.listenTo(this._reader, 'change:status', () => {
      var status = this._reader.status();
      switch (status) {
      case Reader.Status.Opened:
        this.assign('#content', new ScreenCollectionView({
          el: this.$('#content'),
          screens: this._reader.screens(),
          setting: this._setting.screenSetting(),
          mover: this._reader,
          template: templates.screens,
        }));
        break;
      case Reader.Status.Closed:
        this.dissociate('#content');
        break;
      }
    });

    if ('url' in this._queryOptions) {
      // TODO(seikichi): is this safe?
      var loc = document.location;
      var url = encodeURI(this._queryOptions['url']);
      var origin = loc.protocol + '//' + loc.host;
      if (!strings.startsWith(url, loc.protocol + '//' + loc.host)) {
        url = origin + '/' + url;
      }

      this._reader.openURL(url);
    }
  }

  onEnterMenu() {
    this.$('#header, #footer').slideDown();
  }

  onLeaveMenu() {
    this.$('#header, #footer').slideUp();
  }

  presenter(): string {
    return this._template({});
  }

  onDragOver(jqEvent: any) {
   var event: DragEvent = jqEvent.originalEvent;
    event.stopPropagation();
    event.preventDefault();
  }

  onDrop(jqEvent: any) {
    var event: DragEvent = jqEvent.originalEvent;
    event.stopPropagation();
    event.preventDefault();
    var files = event.dataTransfer.files;
    if (files.length === 0) { return; }
    this._reader.openFile(files[0]);
  }
}

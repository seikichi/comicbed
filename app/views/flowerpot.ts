import Factory = require('models/factory');
import Reader = require('models/reader');
import Setting = require('models/setting');
import CompositeView = require('views/composite');
import ScreenCollectionView = require('views/screens');

import templates = require('templates');
import strings = require('utils/strings');

export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private _template: HTMLTemplate;
  private _queryOptions: {[field:string]:string;};

  private _reader: Reader.Reader;
  private _setting: Setting.Setting;

  events: {[event:string]: any};

  constructor($el: JQuery,
              template: HTMLTemplate,
              options: {[field:string]:string;}) {
    this._template = template;
    this._queryOptions = options;
    this._setting = Factory.createSetting(this._queryOptions);
    this._reader = Factory.createReader({
      width: $el.width(),
      height: $el.height()
    }, this._setting);

    (<any>window).reader = this._reader;

    this.events = {
      'drop': 'onDrop',
      'dragover': 'onDragOver',
    };
    this.el = $el;
    super({});
  }

  initialize(): void {
    this.assign('#content', new ScreenCollectionView({
      el: this.$('#content'),
      screens: this._reader.screens(),
      setting: this._setting.screenSetting(),
      mover: this._reader,
      template: templates.screens,
    }));

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

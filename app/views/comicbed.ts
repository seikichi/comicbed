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
import DialogView = require('views/dialog');
import ErrorView = require('views/error');
import InfoView = require('views/info');

import templates = require('templates');
import strings = require('utils/strings');

// god class ლ(╹◡╹ლ)

export = ComicBedView;

class ComicBedView extends CompositeView {
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
    this.id = 'comicbed';

    this.events = {
      'drop': 'onDrop',
      'dragover': 'onDragOver',
      'mouseleave #menu-remove-area': 'onEnterMenu',
      'mouseenter #menu-remove-area': 'onLeaveMenu',
      'tap #mobile-touch-toggle-menu': 'onToggleMenu',
      'click #info-button': 'onInfoButtonClick',
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

    this.assign('#error-dialog-holder', new DialogView({
      id: 'error-dialog',
      template: templates.dialog,
      innerView: new ErrorView({
        template: templates.error,
        reader: this._reader,
      }),
    }));

    this.assign('#info-dialog-holder', new DialogView({
      id: 'info-dialog',
      template: templates.dialog,
      innerView: new InfoView({
        template: templates.info
      }),
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
      case Reader.Status.Error:
        (<any>this.$('#error-dialog')).popup('open');
      case Reader.Status.Closed:
        this.dissociate('#content');
        this.onEnterMenu();
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

  onToggleMenu() {
    this.$('#header, #footer').slideToggle();
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

  onInfoButtonClick() {
    (<any>this.$('#info-dialog')).popup('open');
  }
}

import $ = require('jquery');
import Factory = require('models/factory');
import Reader = require('models/reader');
import Setting = require('models/setting');
import CompositeView = require('views/composite');
import ScreenCollectionView = require('views/screens');
import ProgressView = require('views/progress');
import HeaderView = require('views/header');
import FooterView = require('views/footer');
import DialogView = require('views/dialog');
import ErrorView = require('views/error');
import HelpView = require('views/help');
import SettingView = require('views/setting');

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
      'click #help-button': 'onHelpButtonClick',
      'click #setting-button': 'onSettingButtonClick',
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

    this.assign('#help-dialog-holder', new DialogView({
      id: 'help-dialog',
      template: templates.dialog,
      innerView: new HelpView({
        template: templates.help
      }),
    }));

    this.assign('#progress-dialog-holder', new DialogView({
      id: 'progress-dialog',
      template: templates.dialog,
      innerView: new ProgressView({
        template: templates.progress,
        reader: this._reader,
      }),
    }));

    this.assign('#setting-dialog-holder', new DialogView({
      id: 'setting-dialog',
      template: templates.dialog,
      innerView: new SettingView({
        template: templates.setting,
        setting: this._setting,
      }),
    }));

    this.listenTo(this._reader, 'change:status', () => {
      var status = this._reader.status();
      switch (status) {
      case Reader.Status.Opening:
        (<any>this.$('#progress-dialog')).popup('open');
        break;
      case Reader.Status.Opened:
        (<any>this.$('#progress-dialog')).popup('close');
        this.assign('#content', new ScreenCollectionView({
          el: this.$('#content'),
          screens: this._reader.screens(),
          setting: this._setting.screenSetting(),
          mover: this._reader,
          template: templates.screens,
        }));
        break;
      case Reader.Status.Error:
        (<any>this.$('#progress-dialog')).popup('close');
        (<any>this.$('#error-dialog')).popup('open');
      case Reader.Status.Closed:
        this.dissociate('#content');
        this.onEnterMenu();
        (<any>this.$('#progress-dialog')).popup('close');
        break;
      }
    });

    this.listenToOnce(this, 'initialized', () => {
      if ('url' in this._queryOptions) {
        var loc = document.location;
        var url = encodeURI(this._queryOptions['url']);
        var origin = loc.protocol + '//' + loc.host;
        if (!strings.startsWith(url, loc.protocol + '//' + loc.host)) {
          url = origin + '/' + url;
        }
        this._reader.openURL(url);
      }
    });
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

  onHelpButtonClick() {
    (<any>this.$('#help-dialog')).popup('open');
  }

  onSettingButtonClick() {
    (<any>this.$('#setting-dialog')).popup('open');
  }
}

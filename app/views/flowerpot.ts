import Factory = require('models/factory');
import Reader = require('models/reader');
import Setting = require('models/setting');
import CompositeView = require('views/composite');
import ScreenCollectionView = require('views/screens');
import ModalView = require('views/modal');
import ProgressView = require('views/progress');
import HeaderView = require('views/header');

import templates = require('templates');
import strings = require('utils/strings');

export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private _template: HTMLTemplate;
  private _queryOptions: {[field:string]:string;};

  private _reader: Reader.Reader;
  private _setting: Setting.Setting;
  private _modal: ModalView;
  private _header: HeaderView;

  private _mouseOnMenu: boolean;

  events: {[event:string]: any};

  constructor(template: HTMLTemplate,
              options: {[field:string]:string;}) {
    this._template = template;
    this._queryOptions = options;
    this._modal = null;
    this._mouseOnMenu = false;

    this.events = {
      'drop': 'onDrop',
      'dragover': 'onDragOver',
      'mouseenter #header': 'onEnterMenu',
      'mouseleave #header': 'onLeaveMenu',
    };
    super({});
  }

  initialize(): void {
    this._setting = Factory.createSetting(this._queryOptions);
    this._reader = Factory.createReader({
      width: this.$el.width(),
      height: this.$el.height()
    }, this._setting);

    this._header = new HeaderView({
      template: templates.header,
      reader: this._reader,
    });
    this.assign('#header', this._header);

    // Note: for debug
    (<any>window).reader = this._reader;

    this.listenTo(this._reader, 'change:status', () => {
      // TODO(seikichi): fix those ugly code ...
      var status = this._reader.status();
      if (status === Reader.Status.Opened) {
        this.assign('#content', new ScreenCollectionView({
          el: this.$('#content'),
          screens: this._reader.screens(),
          setting: this._setting.screenSetting(),
          mover: this._reader,
          template: templates.screens,
        }));

        this.dissociate('#modal');
        this.render();
      } else {
        this.dissociate('#content');

        if (status === Reader.Status.Opening) {
          this._modal = new ModalView({
            title: 'Opening a new book',
            el: this.$('#modal'),
            template: templates.modal,
            innerView: new ProgressView({reader: this._reader}),
            buttonTexts: ['Cancel']
          });
          this.assign('#modal', this._modal);
          this._modal.on('Cancel', () => {
            console.log('cancel');
            this._reader.close();
          });
        } else {
          this.dissociate('#modal');
        }
        this.render();
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
    this._mouseOnMenu = true;
    this.showMenu();
    setTimeout(() => {
      if (!this._mouseOnMenu) { this.hideMenu(); }
    }, 5000);
  }

  onLeaveMenu() {
    this._mouseOnMenu = false;
    this.hideMenu();
  }

  showMenu(): void {
    this._header.show();
  }

  hideMenu(): void {
    this._header.hide();
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

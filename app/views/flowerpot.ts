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
  private _modal: ModalView;
  // private _footer: FooterView;

  events: {[event:string]: any};

  constructor(template: HTMLTemplate,
              options: {[field:string]:string;}) {
    this._template = template;
    this._queryOptions = options;
    this._modal = null;

    this.attributes = {'data-role': 'page'};
    this.id = 'flowerpot';

    this.events = {
      'drop': 'onDrop',
      'dragover': 'onDragOver',
      'mouseenter #content': 'onLeaveMenu',
      'mouseleave #content': 'onEnterMenu',
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

    // this._footer = new FooterView({
    //   template: templates.footer,
    //   reader: this._reader,
    //   setting: this._setting.screenSetting(),
    // });
    // this.assign('#footer', this._footer);

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

        // this.dissociate('#modal');
        // this.render();
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
        // this.render();
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

  // onEnterMenu() {
  //   this.showMenu();
  // }

  // onLeaveMenu() {
  //   this.hideMenu();
  // }

  // showMenu(): void {
  //   this._header.show();
  //   this._footer.show();
  // }

  // hideMenu(): void {
  //   this._header.hide();
  //   this._footer.hide();
  // }

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

import Backbone = require('backbone');
import BaseView = require('views/base');
import Reader = require('models/reader');
import templates = require('templates');
import Screen = require('models/screen');
import DropboxStorage = require('utils/dropbox');
import GoogoleDriveStorage = require('utils/gdrive');
import Picker = require('utils/picker');

export = FooterView;

class FooterView extends BaseView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;
  private _setting: Screen.Setting;

  private _options: FooterView.Options;
  events: {[event:string]:string;};

  private _chooserOpened: boolean;

  constructor(options: FooterView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._template = options.template;
    this._setting = options.setting;
    this._chooserOpened = false;

    this.events = {
      'change #page-slider': 'onChangePageSlider',
      'slidestop #page-slider': 'onPageSliderStop',
      'click #file-button': 'onClickFileButton',
      'change #file-input': 'onChangeFileInput',
      'click #dropbox-button': 'onClickDropBox',
      'click #google-drive-button': 'onClickGoogleDrive',
    }
    super(options);
  }

  onPageSliderStop() {
    var value = this.$('#page-slider').val();
    if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
      value = this._reader.totalPageNum() - value + 1;
    }
    this._reader.goToPage(value - 1);
  }

  onChangePageSlider() {
    var value = this.$('#page-slider').val();
    if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
      value = this._reader.totalPageNum() - value + 1;
    }
    this.$('#page-slider-label').html(value + '/' + this._reader.totalPageNum());
  }

  onClickFileButton() {
    if (this._chooserOpened) { return; }
    this.$('#file-input').click();
  }

  onChangeFileInput(jqEvent: any) {
    var event = jqEvent.originalEvent;
    var files = event.target.files;
    if (files.length !== 0) {
      this._reader.openFile(files[0])
    }
  }

  onClickGoogleDrive() {
    if (this._chooserOpened) { return; }
    this._chooserOpened = true;
    GoogoleDriveStorage.createPicker()
      .pick()
      .then((result: Picker.Result) => {
        this._reader.openURL(result.url, result);
      }).finally(() => {
        this._chooserOpened = false;
      });
  }

  onClickDropBox() {
    if (this._chooserOpened) { return; }
    this._chooserOpened = true;
    DropboxStorage.createPicker()
      .pick()
      .then((result: Picker.Result) => {
        this._reader.openURL(result.url, result);
      }).finally(() => {
        this._chooserOpened = false;
      });
  }

  initialize() {
    this.listenTo(this._reader, 'change', () => {
      this.render();
      this.$el.trigger('create');
    });
    this.listenTo(this._setting, 'change', () => {
      this.render();
      this.$el.trigger('create');
    });
  }

  presenter() {
    var opened = this._reader.status() === Reader.Status.Opened;
    var total = this._reader.totalPageNum();
    var current = this._reader.currentPageNum() + 1;
    var value = current;
    var reverse = this._setting.pageDirection() === Screen.PageDirection.R2L;
    if (reverse) {
      value = total - value + 1;
    }
    return this._template({
      opened: opened,
      alignedCurrentPageNum: value,
      currentPageNum: current,
      totalPageNum: total,
      reverse: reverse,
    });
  }
}

module FooterView {
  export interface Options {
    reader: Reader.Reader;
    template: HTMLTemplate;
    setting: Screen.Setting;
  }
}

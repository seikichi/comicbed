import Backbone = require('backbone');
import BaseView = require('views/composite');
import CompositeView = require('views/composite');
import Reader = require('models/reader');
import templates = require('templates');
import Screen = require('models/screen');

export = FooterView;

class FooterView extends CompositeView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;
  private _setting: Screen.Setting;

  private _options: FooterView.Options;
  events: {[event:string]:string;};

  constructor(options: FooterView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._template = options.template;
    this._setting = options.setting;
    super(options);
  }

  show() {
    this.$('#footer-content-wrapper').slideDown();
  }
  hide() {
    this.$('#footer-content-wrapper').slideUp();
  }

  initialize() {
    this.assign('#footer-content', new FooterContentView({
      reader: this._reader,
      template: templates.footercontent,
      setting: this._setting,
    }));
  }

  presenter() {
    return this._template({});
  }
}

module FooterView {
  export interface Options extends Backbone.ViewOptions {
    reader: Reader.Reader;
    template: HTMLTemplate;
    setting: Screen.Setting;
  }
}

class FooterContentView extends BaseView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;
  private _setting: Screen.Setting;
  private _$slider: JQuery;


  private _options: FooterView.Options;
  events: {[event:string]:string;};

  constructor(options: FooterView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._template = options.template;
    this._setting = options.setting;
    super(options);
  }

  initialize() {
    this.listenTo(this._reader, 'change:currentPageNum', this.render);
  }

  presenter() {
    return this._template({
      currentPageNum: this._reader.currentPageNum() + 1,
      totalPageNum: this._reader.totalPageNum(),
    });
  }

  render() {
    super.render();
    this.createSlider();
    return this;
  }

  private createSlider() {
    var value = this._reader.currentPageNum() + 1;
    if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
      value = this._reader.totalPageNum() - value + 1;
    }
    this._$slider = this.$('.slider');
    this._$slider.slider({
      min: 1,
      max: this._reader.totalPageNum(),
      step: 1,
      value: value,
      change: (event: any, ui: any) => {
        this.onSliderChange(ui.value);
      }
    });
  }

  private onSliderChange(value: number) {
    if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
      value = this._reader.totalPageNum() - value + 1;
    }
    this._reader.goToPage(value - 1);
  }
}

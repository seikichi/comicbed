import Backbone = require('backbone');
import BaseView = require('views/base');
import Reader = require('models/reader');
import templates = require('templates');
import Screen = require('models/screen');

export = FooterView;

class FooterView extends BaseView {
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

  initialize() {
    this.listenTo(this._reader, 'change', () => {
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

// module FooterView {
//   export interface Options extends Backbone.ViewOptions {
//     reader: Reader.Reader;
//     template: HTMLTemplate;
//     setting: Screen.Setting;
//   }
// }

// class FooterContentView extends BaseView {
//   private _reader: Reader.Reader;
//   private _template: HTMLTemplate;
//   private _setting: Screen.Setting;
//   private _$slider: JQuery;


//   private _options: FooterView.Options;
//   events: {[event:string]:string;};

//   constructor(options: FooterView.Options) {
//     this._options = options;
//     this._reader = options.reader;
//     this._template = options.template;
//     this._setting = options.setting;
//     super(options);
//   }

//   initialize() {
//     this.listenTo(this._reader, 'change:currentPageNum', this.render);
//   }

//   presenter() {
//     return this._template({
//       currentPageNum: this._reader.currentPageNum() + 1,
//       totalPageNum: this._reader.totalPageNum(),
//     });
//   }

//   render() {
//     super.render();
//     this.createSlider();
//     return this;
//   }

//   private createSlider() {
//     var value = this._reader.currentPageNum() + 1;
//     if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
//       value = this._reader.totalPageNum() - value + 1;
//     }
//     this._$slider = this.$('.slider');
//     this._$slider.slider({
//       min: 1,
//       max: this._reader.totalPageNum(),
//       step: 1,
//       value: value,
//       change: (event: any, ui: any) => {
//         this.onSliderChange(ui.value);
//       }
//     });
//   }

//   private onSliderChange(value: number) {
//     if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
//       value = this._reader.totalPageNum() - value + 1;
//     }
//     this._reader.goToPage(value - 1);
//   }
// }

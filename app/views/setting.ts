import Backbone = require('backbone');
import BaseView = require('views/base');

export = SettingView;

class SettingView extends BaseView {
  private _template: HTMLTemplate;

  private _options: SettingView.Options;
  events: {[event:string]:string;};

  constructor(options: SettingView.Options) {
    this._options = options;
    this._template = options.template;
    this.events = {
      // 'click #info-button': 'onClickInfo',
      // 'click #close-button': 'onClickClose',
    };
    super(options);
  }

  initialize() {
    // this.listenTo(this._reader, 'change:title change:status', () => {
    //   this.render();
    //   this.$el.trigger('create');
    // });
  }

  presenter() {
    return this._template({});
  }
}

module SettingView {
  export interface Options extends Backbone.ViewOptions {
    template: HTMLTemplate;
  }
}

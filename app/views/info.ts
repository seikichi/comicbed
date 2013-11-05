import Backbone = require('backbone');
import BaseView = require('views/base');

export = InfoView;

class InfoView extends BaseView {
  private _options: InfoView.Options;
  private _template: HTMLTemplate;

  constructor(options: InfoView.Options) {
    this._options = options;
    this._template = options.template;
    super(options);
  }

  presenter() {
    return this._template({});
  }
}

module InfoView {
  export interface Options extends Backbone.ViewOptions {
    template: HTMLTemplate;
  }
}

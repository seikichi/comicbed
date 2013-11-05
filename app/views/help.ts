import Backbone = require('backbone');
import BaseView = require('views/base');
import device = require('utils/device');

export = HelpView;

class HelpView extends BaseView {
  private _options: HelpView.Options;
  private _template: HTMLTemplate;

  constructor(options: HelpView.Options) {
    this._options = options;
    this._template = options.template;
    super(options);
  }

  presenter() {
    return this._template({
      isMobile: device.isMobile(),
    });
  }
}

module HelpView {
  export interface Options extends Backbone.ViewOptions {
    template: HTMLTemplate;
  }
}

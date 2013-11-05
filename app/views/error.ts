import Backbone = require('backbone');
import Reader = require('models/reader');
import BaseView = require('views/base');

export = ErrorView;

class ErrorView extends BaseView {
  private _options: ErrorView.Options;
  private _template: HTMLTemplate;
  private _reader: Reader.Reader;

  constructor(options: ErrorView.Options) {
    this._options = options;
    this._template = options.template;
    this._reader = options.reader;
    super(options);
  }

  initialize() {
    this.listenTo(this._reader, 'change:message', () => {
      this.render();
      this.$el.trigger('create');
    });
  }

  presenter() {
    return this._template({
      message: this._reader.message(),
    });
  }
}

module ErrorView {
  export interface Options extends Backbone.ViewOptions {
    reader: Reader.Reader;
    template: HTMLTemplate;
  }
}

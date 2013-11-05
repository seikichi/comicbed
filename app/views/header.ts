import Backbone = require('backbone');
import Reader = require('models/reader');
import BaseView = require('views/base');

export = HeaderView;

class HeaderView extends BaseView {
  private _reader: Reader.Reader;
  private _template: HTMLTemplate;

  private _options: HeaderView.Options;
  events: {[event:string]:string;};

  constructor(options: HeaderView.Options) {
    this._options = options;
    this._reader = options.reader;
    this._template = options.template;
    this.events = {
      'click #info-button': 'onClickInfo',
      'click #close-button': 'onClickClose',
    };
    super(options);
  }

  initialize() {
    this.listenTo(this._reader, 'change:title change:status', () => {
      this.render();
      this.$el.trigger('create');
    });
  }

  presenter() {
    return this._template({
      title: this._reader.title(),
      opened: this._reader.status() === Reader.Status.Opened,
    });
  }

  onClickInfo() {}

  onClickClose() {
    this._reader.close();
  }
}

module HeaderView {
  export interface Options extends Backbone.ViewOptions {
    reader: Reader.Reader;
    template: HTMLTemplate;
  }
}

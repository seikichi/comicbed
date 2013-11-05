import Backbone = require('backbone');
import BaseView = require('views/base');
import CompositeView = require('views/composite');

export = DialogView;

class DialogView extends CompositeView {
  private _options: DialogView.Options;
  private _template: HTMLTemplate;
  private _innerView: BaseView;

  constructor(options: DialogView.Options) {
    this._options = options;
    this._template = options.template;
    this._innerView = options.innerView;
    super(options);
  }

  initialize() {
    this.assign('#' + this._options.id, this._innerView);
  }

  presenter() {
    return this._template({
      id: this._options.id,
    });
  }

  render() {
    super.render();
    this.$el.trigger('create');
    return this;
  }
}

module DialogView {
  export interface Options extends Backbone.ViewOptions {
    id: string;
    template: HTMLTemplate;
    innerView: BaseView;
  }
}

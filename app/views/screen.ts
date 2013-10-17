import BaseView = require('views/base');
import Screen = require('models/screen');
import Spinner = require('spin');

export = ScreenView;

class ScreenView extends BaseView {
  private _screen: Screen.Screen;
  private _spinner: Spinner;

  constructor(options: ScreenView.Options) {
    this._screen = options.screen;
    this._spinner = new Spinner();
    super(options);
  }

  initialize() {
    this.listenTo(this._screen, 'change', this.render);
  }

  resize(width: number, height: number): void {
    this._screen.resize(width, height);
    this.$el.width(width);
    this.$el.height(height);
  }

  render() {
    this.$el.empty();
    switch (this._screen.status()) {
    case Screen.Status.Success:
    case Screen.Status.Interrupted:
      if (this._spinner !== null) {
        this._spinner.stop();
      }
      this.$el.append(this._screen.content());
      break;
    case Screen.Status.Loading:
      this._spinner.spin(this.$el.get(0));
      break;
    case Screen.Status.Error:
      break;
    }
    return this;
  }
}

module ScreenView {
  export interface Options extends Backbone.ViewOptions {
    screen: Screen.Screen;
  }
}

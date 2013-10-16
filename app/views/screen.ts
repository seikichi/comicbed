import BaseView = require('views/base');
import Screen = require('models/screen');

export = ScreenView;

class ScreenView extends BaseView {
  private _screen: Screen.Screen;

  constructor(options: ScreenView.Options) {
    this._screen = options.screen;
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
    if (this._screen.status() === Screen.Status.Success) {
      this.$el.append(this._screen.content());
    }
    return this;
  }
}

module ScreenView {
  export interface Options extends Backbone.ViewOptions {
    screen: Screen.Screen;
  }
}
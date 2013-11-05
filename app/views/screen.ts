import BaseView = require('views/base');
import Screen = require('models/screen');
import Spinner = require('spin');
import device = require('utils/device')

export = ScreenView;

class ScreenView extends BaseView {
  private _isCenter: boolean;
  private _screen: Screen.Screen;
  private _spinner: Spinner;
  private _template: HTMLTemplate;

  constructor(options: ScreenView.Options) {
    this._isCenter = options.isCenter;
    this._screen = options.screen;
    this._spinner = new Spinner();
    this._template = options.template;
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

  presenter() {
    return this._template({
      isMobile: device.isMobile(),
      isCenter: this._isCenter
    });
  }

  render() {
    super.render();
    var $screen = this.$('.screen');

    switch (this._screen.status()) {
    case Screen.Status.Success:
    case Screen.Status.Interrupted:
      if (this._spinner !== null) {
        this._spinner.stop();
      }
      $screen.append(this._screen.content());
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
    isCenter: boolean;
    screen: Screen.Screen;
    template: HTMLTemplate;
  }
}

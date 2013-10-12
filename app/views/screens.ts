import BaseView = require('views/base');
import ScreenView = require('views/screen');
import Screen = require('models/screen');
import Screens = require('collections/screens');

export = ScreenCollectionView;

class ScreenCollectionView extends BaseView {
  private _setting: Screen.Setting;
  private _screens: Screens.Screens;
  private _childViews: ScreenView[];

  private _current: Screen.Screen;
  private _prevs: Screens.Collection;
  private _nexts: Screens.Collection;

  constructor(options: ScreenCollectionView.Options) {
    this._screens = options.screens;
    this._childViews = [];
    this._current = this._screens.currentScreen();
    this._prevs = this._screens.prevScreens();
    this._nexts = this._screens.nextScreens();
    super(options);
  }

  initialize() {
    this.listenTo(this._prevs, 'add remove reset sort', this.render);
    this.listenTo(this._nexts, 'add remove reset sort', this.render);
  }

  render() {
    this.removeChildViews();
    this.$el.empty();
    // order Screen.Screen
    var screens: Screen.Screen[] = [this._current];
    // for (var i = 0, len = this._prevs.length; i < len; ++i) {
    //   screens.push(this._prevs.at(0));
    // }
    // for (var i = 0, len = this._nexts.length; i < len; ++i) {
    //   screens.unshift(this._nexts.at(0));
    // }
    for (var i = 0, len = screens.length; i < len; ++i) {
      var view = new ScreenView({screen: screens[i]});
      this.$el.append(view.render().el)
      this._childViews.push(view);
    }
    return this;
  }

  close(): void {
    super.close();
    this.removeChildViews();
  }

  removeChildViews(): void {
    for (var i = 0, len = this._childViews.length; i < len; ++i) {
      this._childViews[i].close();
    }
    this._childViews = [];
  }
}

module ScreenCollectionView {
  export interface Options extends Backbone.ViewOptions {
    setting: Screen.Setting;
    screens: Screens.Screens;
  }
}

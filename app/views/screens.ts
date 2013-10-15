import IScroll = require('iscroll');

import BaseView = require('views/base');
import ScreenView = require('views/screen');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Reader = require('models/reader');

export = ScreenCollectionView;

class ScreenCollectionView extends BaseView {
  events: {[event:string]:string;};

  private _setting: Screen.Setting;
  private _screens: Screens.Screens;
  private _childViews: ScreenView[];

  private _current: Screen.Screen;
  private _prevs: Screens.Collection;
  private _nexts: Screens.Collection;

  private _template: (data: {[key:string]: any;}) => string;
  private _scroll: IScroll;
  private _mover: Reader.ScreenMover;

  constructor(options: ScreenCollectionView.Options) {
    this._screens = options.screens;
    this._template = options.template;
    this._setting = options.setting;
    this._mover = options.mover;
    this._childViews = [];
    this._current = this._screens.currentScreen();
    this._prevs = this._screens.prevScreens();
    this._nexts = this._screens.nextScreens();
    this._scroll = null;

    this.events = {
      'click': 'onLeftClick',
      'contextmenu': 'onRightClick',
    };
    super(options);
  }

  initialize() {
    this.listenTo(this._prevs, 'add remove reset sort', this.render);
    this.listenTo(this._nexts, 'add remove reset sort', this.render);

    $(window).on('resize', () => { this.render(); });
  }

  render() {
    this.$el.html(this._template({}));
    // order Screen.Screen
    var screens: Screen.Screen[] = [this._current];
    for (var i = 0, len = this._prevs.length; i < len; ++i) {
      screens.push(this._prevs.at(0));
    }
    for (var i = 0, len = this._nexts.length; i < len; ++i) {
      screens.unshift(this._nexts.at(0));
    }
    var centerPageIndex = this._nexts.length;
    if (this._setting.pageDirection() === Screen.PageDirection.L2R) {
      screens.reverse();
      centerPageIndex = this._prevs.length;
    }
    // create child views and insert those render result
    for (var i = 0, len = screens.length; i < len; ++i) {
      var view = new ScreenView({
        tagName: 'li',
        screen: screens[i]
      });
      view.$el.width(this.$el.width());
      view.$el.height(this.$el.height());
      this.$('ul').append(view.render().el)
      this._childViews.push(view);
    }
    this.$('ul').width(this.$el.width() * screens.length);
    this.createScroll(centerPageIndex);
    return this;
  }

  close(): void {
    super.close();
    this.removeChildViews();
    if (this._scroll !== null) {
      this._scroll.destroy();
      this._scroll = null;
    }
  }

  createScroll(centerPageIndex: number): void {
    if (this._scroll !== null) {
      this._scroll.destroy();
    }
    this._scroll = new IScroll('#screen-scroller', {
      zoom: true,
      mouseWheel: true,
      wheelAction: 'zoom',
      snap: true,
      momentum: false,
      scrollX: true,
      scrollY: true,
      click: false,
      bounce: false,
      snapThreshold: 0.1,
      snapSpeed: 100,
    });
    this._scroll.goToPage(centerPageIndex, 0, 0);

    this._scroll.on('scrollStart', () => {
      this._scroll.zoom(1, 0, 0, undefined);
      this._scroll.goToPage(centerPageIndex, 0, 0);
    });

    this._scroll.on('scrollEnd', () => {
      var newPageIndex = this._scroll.currentPage.pageX;
      if (centerPageIndex === newPageIndex) { return; }
      // TODO(seikichi): fix
      var pageDirection = this._setting.pageDirection();
      if ((centerPageIndex > newPageIndex
           && pageDirection === Screen.PageDirection.R2L)
          || (centerPageIndex < newPageIndex
              && pageDirection === Screen.PageDirection.L2R)) {
        // go forward
        this._mover.goNextScreen();
      } else {
        // go backward
        this._mover.goPrevScreen();
      }

      var newCenterPageIndex = this._nexts.length;
      if (this._setting.pageDirection() === Screen.PageDirection.L2R) {
        newCenterPageIndex = this._prevs.length;
      }
      this._scroll.goToPage(newCenterPageIndex, 0, 0);
    });
  }

  removeChildViews(): void {
    for (var i = 0, len = this._childViews.length; i < len; ++i) {
      this._childViews[i].close();
    }
    this._childViews = [];
  }

  onLeftClick(): void {
    if (this._scroll !== null && !this._scroll.moved) {
      this._mover.goNextScreen();
    }
  }

  onRightClick(event: Event): void {
    event.preventDefault();
    if (this._scroll !== null && !this._scroll.moved) {
      this._mover.goPrevScreen();
    }
  }
}

module ScreenCollectionView {
  export interface Options extends Backbone.ViewOptions {
    setting: Screen.Setting;
    screens: Screens.Screens;
    mover: Reader.ScreenMover;
    template: (data: {[key:string]: any;}) => string;
  }
}

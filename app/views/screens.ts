import IScroll = require('iscroll');

import BaseView = require('views/base');
import ScreenView = require('views/screen');
import Setting = require('models/setting');
import Screen = require('models/screen');
import Screens = require('collections/screens');
import Reader = require('models/reader');
import fullscreen = require('utils/fullscreen');
import templates = require('templates');
import device = require('utils/device');

export = ScreenCollectionView;

// TODO (seikichi): move keybord event handler to another class
// this ScreenCollectionView class has too many work ...
enum KeyCode {
  Enter = 13,
  Space = 32,
  Left = 37,
  Up = 38,
  Right = 39,
  Down = 40,
};

class ScreenCollectionView extends BaseView {
  events: {[event:string]:string;};

  private _setting: Setting.ScreenSetting;
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
      'keydown': 'onKeyDown',
    };
    if (device.isMobile()) {
      this.events = {
        'tap #mobile-touch-move-left': 'onMobileLeft',
        'tap #mobile-touch-move-right': 'onMobileRight',
      };
    }
    super(options);
  }

  initialize() {
    this.listenTo(this._prevs, 'add remove reset sort', this.render);
    this.listenTo(this._nexts, 'add remove reset sort', this.render);
    this.listenTo(this._setting, 'change', this.render);

    $(window).on('resize', () => { this.onResize(); });
  }

  onResize(): void {
    var width = this.$el.width();
    var height = this.$el.height();
    var length = this._childViews.length;
    this.$('ul').width(width * length);
    for (var i = 0; i < length; ++i) {
      this._childViews[i].resize(width, height);
    }
    if (this._scroll !== null) {
      this._scroll.refresh();
      this.goCenterPage();
    }
  }

  goCenterPage(): void {
    var newCenterPageIndex = this._nexts.length;
    if (this._setting.pageDirection() === Screen.PageDirection.L2R) {
      newCenterPageIndex = this._prevs.length;
    }
    this._scroll.goToPage(newCenterPageIndex, 0, 0);
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
        isCenter: i === centerPageIndex,
        tagName: 'li',
        screen: screens[i],
        template: templates.screen,
      });
      view.resize(this.$el.width(), this.$el.height());
      this.$('ul').append(view.render().el)
      this._childViews.push(view);
    }
    this.$('ul').width(this.$el.width() * screens.length);
    this.createScroll(centerPageIndex);
    return this;
  }

  close(): void {
    super.close();
    $(window).off('resize');
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
    this._scroll = new IScroll(this.$('#screen-scroller').get(0), {
      snap: true,
      momentum: false,
      scrollX: true,
      scrollY: true,
      click: true,
      bounce: false,
      snapThreshold: 0.1,
      // snapSpeed: 100,
    });
    this.goCenterPage();

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
      this.goCenterPage();
    });
  }

  removeChildViews(): void {
    for (var i = 0, len = this._childViews.length; i < len; ++i) {
      this._childViews[i].close();
    }
    this._childViews = [];
  }

  goNext(): void {
    this._mover.goNextScreen();
  }

  goPrev(): void {
    this._mover.goPrevScreen();
  }

  onMobileLeft(event: Event): void {
    var pageDirection = this._setting.pageDirection();
    if (pageDirection === Screen.PageDirection.R2L) {
      this.onLeftClick();
    } else {
      this.onRightClick(event);
    }
  }

  onMobileRight(event: Event): void {
    var pageDirection = this._setting.pageDirection();
    if (pageDirection === Screen.PageDirection.L2R) {
      this.onLeftClick();
    } else {
      this.onRightClick(event);
    }
  }

  onLeftClick(): void {
    this.$el.focus();
    if (this._scroll !== null && !this._scroll.moved) {
      this.goNext();
    }
  }

  onRightClick(event: Event): void {
    this.$el.focus();
    event.preventDefault();
    if (this._scroll !== null && !this._scroll.moved) {
      this.goPrev();
    }
  }

  onKeyDown(jqEvent: any) {
    this.$el.focus();
    switch (jqEvent.keyCode) {
    case KeyCode.Enter:
      fullscreen.toggle(document.body);
      break;
    case KeyCode.Space:
      this._setting.toggleViewMode();
      break;
    case KeyCode.Left:
      if (this._setting.pageDirection() === Screen.PageDirection.R2L) {
        this.goNext();
      } else {
        this.goPrev();
      }
      break;
    case KeyCode.Right:
      if (this._setting.pageDirection() === Screen.PageDirection.L2R) {
        this.goNext();
      } else {
        this.goPrev();
      }
      break;
    }
  }
}

module ScreenCollectionView {
  export interface Options extends Backbone.ViewOptions {
    setting: Setting.ScreenSetting;
    screens: Screens.Screens;
    mover: Reader.ScreenMover;
    template: (data: {[key:string]: any;}) => string;
  }
}

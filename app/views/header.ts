import _ = require('underscore');
import BaseView = require('views/base');
import CompositeView = require('views/composite');
import Book = require('models/book');
import Setting = require('models/setting');
import JQueryUI = require('jqueryui');
import logger = require('utils/logger');
import templates = require('templates');

export = HeaderView;

// TODO (seikichi): footer のコピペだったり色々クズコードなので何とかする

class HeaderView extends CompositeView {
  private _book: Book.ModelInterface;
  private _template: (data: {[attr:string]:any;}) => string;
  private _mouseover: boolean;
  events: {[event:string]:string;};

  constructor(book: Book.ModelInterface,
              template: (data: {[attr:string]:any;}) => string) {
    this._book = book;
    this._template = template;
    this.events = {
      'mouseenter #header-active-area': 'show',
      'mouseleave #header-active-area': 'hide',
    };
    this._mouseover = false;
    super();
  }

  initialize() {
    this.assign('#header-content', new HeaderContentView(this._book, templates.headercontent));
  }

  show() {
    this._mouseover = true;
    logger.info('mouse enters the header area: header show');
    this.$('#header-content-area').slideDown();
  }
  hide() {
    this._mouseover = false;
    logger.info('mouse leaves the header area: header hide');
    // this.$('#header-content-area').slideUp();
    setTimeout(() => { if (!this._mouseover) { this.$('#header-content-area').slideUp(); } }, 1000);
  }

  presenter() {
    return this._template({});
  }

  render() {
    super.render();
    setTimeout(() => { if (!this._mouseover) { this.hide(); } }, 2000);
    return this;
  }
}

class HeaderContentView extends BaseView {
  private _book: Book.ModelInterface;
  private _template: (data: {[attr:string]:any;}) => string;
  private _$slider: JQuery;
  private _setting: Setting.ModelInterface;

  constructor(book: Book.ModelInterface,
              template: (data: {[attr:string]:any;}) => string) {
    this._book = book;
    this._template = template;
    this._setting = book.setting();
    super();
  }

  initialize() {
    this.listenTo(this._book, 'change', this.render);
  }

  presenter() {
    return this._template(_.extend(this._setting.toJSON(), {
      protocol: location.protocol,
      host: location.host,
      onePage: this._setting.viewMode() === Setting.ViewMode.OnePage,
      twoPage: this._setting.viewMode() === Setting.ViewMode.TwoPage,
      L2R: this._setting.pageDirection() === Setting.PageDirection.L2R,
      R2L: this._setting.pageDirection() === Setting.PageDirection.R2L,
    }));
  }

  render() {
    super.render();
    return this;
  }
}



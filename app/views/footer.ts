import _ = require('underscore');
import BaseView = require('views/base');
import Book = require('models/book');
import Setting = require('models/setting');
import JQueryUI = require('jqueryui');
import logger = require('utils/logger');

export = FooterView;

class FooterView extends BaseView {
  private _book: Book.ModelInterface;
  private _template: (data: {[attr:string]:any;}) => string;
  events: {[event:string]:string;};

  private _$slider: JQuery;

  constructor(book: Book.ModelInterface,
              template: (data: {[attr:string]:any;}) => string) {
    this._book = book;
    this._template = template;
    this.events = {
      'mouseenter #footer-active-area': 'show',
      'mouseleave #footer-active-area': 'hide',
    };
    super();
  }

  initialize() {
    this.listenTo(this._book, 'change', this.onBookChange);
  }

  private onBookChange() {
    var value = this._book.currentPageNum();
    if (this._book.setting().pageDirection() === Setting.PageDirection.R2L) {
      value = this._book.totalPageNum() - value + 1;
    }
    this._$slider.slider({value: value});
  }

  private createSlider() {
    var value = this._book.currentPageNum();
    if (this._book.setting().pageDirection() === Setting.PageDirection.R2L) {
      value = this._book.totalPageNum() - value + 1;
    }
    this._$slider = this.$('.slider');
    this._$slider.slider({
      min: 1,
      max: this._book.totalPageNum(),
      step: 1,
      value: value,
      change: (event: any, ui: any) => {
        this.onSliderChange(ui.value);
      }
    });
  }

  private onSliderChange(value: number) {
    if (this._book.setting().pageDirection() === Setting.PageDirection.R2L) {
      value = this._book.totalPageNum() - value + 1;
    }
    logger.info('move to page: ' + value);
    this._book.goTo(value);
  }

  show() {
    logger.info('mouse enters the footer are: footer show');
    this.$('#footer-content-area').slideDown();
  }
  hide() {
    logger.info('mouse leaves the footer are: footer hide');
    this.$('#footer-content-area').slideUp();
  }

  presenter() {
    return this._template({});
  }

  render() {
    super.render();
    this.createSlider();
    setTimeout(() => { this.hide(); }, 2000);
    return this;
  }
}


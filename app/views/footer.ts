import _ = require('underscore');
import BaseView = require('views/base');
import CompositeView = require('views/composite');
// import Book = require('models/book');
// import Setting = require('models/setting');
// import JQueryUI = require('jqueryui');
// import logger = require('utils/logger');
// import templates = require('templates');

export = FooterView;

class FooterView extends CompositeView {}
//   private _book: Book.ModelInterface;
//   private _template: (data: {[attr:string]:any;}) => string;
//   events: {[event:string]:string;};
//   private _mouseover: boolean;


//   constructor(book: Book.ModelInterface,
//               template: (data: {[attr:string]:any;}) => string) {
//     this._book = book;
//     this._template = template;
//     this.events = {
//       'mouseenter #footer-active-area': 'show',
//       'mouseleave #footer-active-area': 'hide',
//     };
//     this._mouseover = false;
//     super();
//   }

//   initialize() {
//     this.assign('#footer-content', new FooterContentView(this._book, templates.footercontent));
//   }

//   show() {
//     this._mouseover = true;
//     logger.info('mouse enters the footer are: footer show');
//     this.$('#footer-content-area').slideDown();
//   }
//   hide() {
//     this._mouseover = false;
//     logger.info('mouse leaves the footer are: footer hide');
//     // this.$('#footer-content-area').slideUp();
//     setTimeout(() => { if (!this._mouseover) { this.$('#footer-content-area').slideUp(); } }, 1000);
//   }

//   presenter() {
//     return this._template({});
//   }

//   render() {
//     super.render();
//     setTimeout(() => { if (!this._mouseover) { this.hide(); } }, 2000);
//     return this;
//   }
// }

// class FooterContentView extends BaseView {
//   private _book: Book.ModelInterface;
//   private _template: (data: {[attr:string]:any;}) => string;
//   private _$slider: JQuery;

//   constructor(book: Book.ModelInterface,
//               template: (data: {[attr:string]:any;}) => string) {
//     this._book = book;
//     this._template = template;
//     super();
//   }

//   initialize() {
//     this.listenTo(this._book, 'change', this.render);
//   }

//   presenter() {
//     return this._template(this._book.toJSON());
//   }

//   render() {
//     super.render();
//     this.createSlider();
//     return this;
//   }

//   private createSlider() {
//     var value = this._book.currentPageNum();
//     if (this._book.setting().pageDirection() === Setting.PageDirection.R2L) {
//       value = this._book.totalPageNum() - value + 1;
//     }
//     this._$slider = this.$('.slider');
//     this._$slider.slider({
//       min: 1,
//       max: this._book.totalPageNum(),
//       step: 1,
//       value: value,
//       change: (event: any, ui: any) => {
//         this.onSliderChange(ui.value);
//       }
//     });
//   }

//   private onSliderChange(value: number) {
//     if (this._book.setting().pageDirection() === Setting.PageDirection.R2L) {
//       value = this._book.totalPageNum() - value + 1;
//     }
//     logger.info('move to page: ' + value);
//     this._book.goTo(value);
//   }
// }

import _ = require('underscore');

import BaseView = require('views/base');
import Book = require('models/book');
import Setting = require('models/setting');

export = ImageView;

class ImageView extends BaseView {
  private events: {[event:string]:string;};

  private template: (data: {[key:string]: any;}) => string;
  private book: Book.ModelInterface;
  private setting: Setting.ModelInterface;

  // models to render
  private currentPageImage: Book.Image.ModelInterface;
  private nextPageImage: Book.Image.ModelInterface;

  constructor(options: ImageView.Options) {
    this.events = {};
    this.template = options.template;
    this.book = options.book;
    this.setting = options.setting;

    this.currentPageImage = null;
    this.nextPageImage = null;

    super({});
  }

  initialize() {
    // TODO (seikichi): fix
    if (this.book.isOpen()) {
      var currentPageNum = this.book.currentPageNum();
      this.currentPageImage = this.book.getPageImage(currentPageNum);
      this.listenTo(this.currentPageImage, 'change', this.render);
    } else {
      this.listenToOnce(this.book, 'change:isOpen', () => {
        var currentPageNum = this.book.currentPageNum();
        this.currentPageImage = this.book.getPageImage(currentPageNum);
        this.listenTo(this.currentPageImage, 'change', this.render);
      });
    }
  }

  presenter(): string {
    var data: {[key:string]:any;} = {};
    if (!_.isNull(this.currentPageImage)) {
      data['currentPageImage'] = this.currentPageImage.toJSON();
    }
    return this.template(data);
  }
}

module ImageView {
  export interface Options {
    template: (data: {[key:string]: any;}) => string;
    book: Book.ModelInterface;
    setting: Setting.ModelInterface;
  }
}
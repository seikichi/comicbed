import _ = require('underscore');

import BaseView = require('views/base');
import Book = require('models/book');
import Setting = require('models/setting');

export = ImageView;

enum Status {
  Loading,
  Error,
  ShowOnePage,
  ShowTwoPages,
}

class ImageView extends BaseView {
  private events: {[event:string]:string;};

  private template: (data: {[key:string]: any;}) => string;
  private book: Book.ModelInterface;
  private setting: Setting.ModelInterface;

  private status: Status;

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
    this.status = Status.Loading;

    super({});
  }

  initialize() {
    this.preparePageImages();
    // TODO(seikichi): resize を this.events に上手く設定したいのだけど...
    $(window).resize(() => { this.fit() });
  }

  private fit() {
    if (this.status === Status.ShowOnePage) {
      this.fitOnePage();
    } else if (this.status === Status.ShowTwoPages) {
      this.fitTwoPage();
    }
  }

  private fitOnePage() {
    var $img = this.$('#page');
    var width = this.$el.width();
    var height = this.$el.height();
    var imageWidth = this.currentPageImage.width();
    var imageHeight = this.currentPageImage.height();

    var scale = Math.min(width / imageWidth, height / imageHeight);
    $img.width(scale * imageWidth).height(scale * imageHeight).css({
      position: 'relative',
      top: (height - $img.height()) / 2.0,
      left: (width - $img.width()) / 2.0,
    });
  }

  private fitTwoPage() {
  }

  private preparePageImages(): void {
    // wait until page is opened
    if (!this.book.isOpen()) {
      this.listenToOnce(this.book, 'change:isOpen', this.preparePageImages);
    }
    // load first page
    var currentPageNum = this.book.currentPageNum();
    this.currentPageImage = this.book.getPageImage(currentPageNum);
    this.processCurrentPageImage();
  }

  private processCurrentPageImage() {
    if (this.currentPageImage.status() === Book.Image.Status.error) {
      // TODO(seikichi): do error handling
      return;
    } else if (this.currentPageImage.status() === Book.Image.Status.loading) {
      this.listenToOnce(this.currentPageImage, 'change', this.processCurrentPageImage);
      return;
    }

    if (this.setting.viewMode() === Setting.ViewMode.OnePage
        || (this.setting.viewMode() === Setting.ViewMode.AutoSpread
            && this.setting.isSpreadPage(this.currentPageImage))
        || (this.book.currentPageNum() + 1 > this.book.totalPageNum())) {
      this.status = Status.ShowOnePage;
      this.listenTo(this.currentPageImage, 'change', this.render);
      this.render();
    } else {
      this.nextPageImage = this.book.getPageImage(this.book.currentPageNum() + 1);
      this.processNextPageImage();
    }
  }

  private processNextPageImage() {
    if (this.nextPageImage.status() === Book.Image.Status.error) {
      // TODO(seikichi): do error handling
      return;
    } else if (this.nextPageImage.status() === Book.Image.Status.loading) {
      this.listenToOnce(this.nextPageImage, 'change', this.processNextPageImage);
      return;
    }

    if (this.setting.viewMode() === Setting.ViewMode.TwoPages
        || (this.setting.viewMode() === Setting.ViewMode.AutoSpread
            && !this.setting.isSpreadPage(this.nextPageImage))) {
      this.status = Status.ShowTwoPages;
      this.listenTo(this.currentPageImage, 'change', this.render);
      this.listenTo(this.nextPageImage, 'change', this.render);
      this.render();
    } else if (this.setting.viewMode() === Setting.ViewMode.AutoSpread) {
      this.status = Status.ShowOnePage;
      this.listenTo(this.currentPageImage, 'change', this.render);
      this.render();
    } else {
      console.log('WAAAAAAAAAA');  // TODO(seikichi):
    }
  }

  presenter(): string {
    var data: {[key:string]:any;} = {
      loading: this.status === Status.Loading,
      error: this.status === Status.Error,
      onepage: this.status === Status.ShowOnePage,
      twopages: this.status === Status.ShowTwoPages,
    };

    if (!_.isNull(this.currentPageImage)) {
      data['currentPageImage'] = this.currentPageImage.toJSON();
    }
    if (!_.isNull(this.nextPageImage)) {
      data['nextPageImage'] = this.nextPageImage.toJSON();
    }
    return this.template(data);
  }

  render() {
    super.render();
    this.fit();
    return this;
  }
}

module ImageView {
  export interface Options {
    template: (data: {[key:string]: any;}) => string;
    book: Book.ModelInterface;
    setting: Setting.ModelInterface;
  }
}
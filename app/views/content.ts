import _ = require('underscore');

import BaseView = require('views/base');
import Book = require('models/book');
import Setting = require('models/setting');

export = ContentView;

class ContentView extends BaseView {
  private events: {[event:string]:string;};

  private template: (data: {[key:string]: any;}) => string;
  private book: Book.ModelInterface;
  private content: Book.DisplayedContents.ModelInterface;

  constructor(options: ContentView.Options) {
    this.events = {};

    this.template = options.template;
    this.book = options.book;
    this.content = null;

    super({});
  }

  initialize() {
    if (this.book.status() !== Book.Status.Opened) {
      this.listenToOnce(this.book, 'change', this.initialize);
      return;
    }
    // TODO(seikichi): events を上手く使いたいのだけど...
    $(window).resize(() => { this.fit() });
    // コンテンツの読み込み
    this.content = this.book.getCurrentContents();
    this.listenTo(this.content, 'change', () => {
      this.render();
      this.fit();
    });
  }

  presenter() {
    // TODO(seikichi): dummy 用に interface 継承して何か作る?
    if (_.isNull(this.content)) {
      return '';
    }
    return this.template(this.content.toJSON());
  }

  private fit() {
    if (_.isNull(this.content)) { return; }
    if (this.content.images().length === 1) {
      this.fitOnePage();
    } else if (this.content.images().length === 2) {
      this.fitTwoPage();
    }
  }

  private fitOnePage() {
    var image = this.content.images().at(0);
    var $img = this.$('#page-0');
    var width = this.$el.width();
    var height = this.$el.height();
    var imageWidth = image.width();
    var imageHeight = image.height();

    var scale = Math.min(width / imageWidth, height / imageHeight);
    $img.width(scale * imageWidth).height(scale * imageHeight).css({
      position: 'relative',
      top: (height - $img.height()) / 2.0,
      left: (width - $img.width()) / 2.0,
    });
  }

  private fitTwoPage() {
    var left_image: Book.Image.ModelInterface;
    var right_image: Book.Image.ModelInterface;
    var $left: JQuery;
    var $right: JQuery;

    // TODO(seikichi): fix me!
    if (this.book.setting().pageDirection() === Setting.PageDirection.L2R) {
      left_image = this.content.images().at(0);
      right_image = this.content.images().at(1);
      $left = this.$('#page-0');
      $right = this.$('#page-1');
    } else {
      left_image = this.content.images().at(1);
      right_image = this.content.images().at(0);
      $left = this.$('#page-1');
      $right = this.$('#page-0');
    }

    var containerWidth = this.$el.width();
    var containerHeight = this.$el.height();

    var left_height = left_image.height();
    var left_width = left_image.width();
    var right_height = right_image.height();
    var right_width = right_image.width();

    var left_scale = 1.0;
    var right_scale = left_height / right_height;

    var width = (left_scale * left_width) + (right_scale * right_width);
    var height = left_height;

    var scale = Math.min(containerWidth / width, containerHeight / height);

    $left
      .width(left_width * left_scale * scale)
      .height(left_height * left_scale * scale);
    $right
      .width(right_width * right_scale * scale)
      .height(right_height * right_scale * scale);

    // TODO (seikichi): fix absolute (?)
    $left.css({
      position: 'absolute',
      top: (containerHeight - $left.height()) / 2,
      left: (containerWidth - $left.width() - $right.width()) / 2
    });
    $right.css({
      position: 'absolute',
      top: (containerHeight - $left.height()) / 2,
      left: $left.width() + (containerWidth - $left.width() - $right.width()) / 2
    });
  }
}

module ContentView {
  export interface Options {
    template: (data: {[key:string]: any;}) => string;
    book: Book.ModelInterface;
  }
}

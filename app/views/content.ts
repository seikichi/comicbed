import _ = require('underscore');

import BaseView = require('views/base');
import Book = require('models/book');
import Page = require('models/page');
import Setting = require('models/setting');

export = ContentView;

class ContentView extends BaseView {
  private _book: Book.ModelInterface;
  private _contents: Page.Content.CollectionInterface;

  constructor(options: ContentView.Options) {
    this._book = options.book;
    this._contents = this._book.contents();
    super({});
  }

  initialize() {
    $(window).resize(() => { this.fit() });
    this.listenTo(this._contents, 'all', () => {
      this.render();
      this.fit();
    });
  }

  private fit() {
    if (this._contents.length === 1) {
      this.fitOnePage();
    } else if (this._contents.length === 2) {
      this.fitTwoPage();
    }
  }

  render() {
    this.$el.empty();
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < this._contents.length; ++i) {
      var c = this._contents.at(i);
      fragment.appendChild(c.element());
    }
    this.$el[0].appendChild(fragment);
    return this;
  }

  private fitOnePage() {
    var element = this._contents.at(0).element();
    var width = this.$el.width();
    var height = this.$el.height();
    var elementWidth = element.width;
    var elementHeight = element.height;

    var scale = Math.min(width / elementWidth, height / elementHeight);

    var newWidth = scale * elementWidth;
    var newHeight = scale * elementHeight;
    $(element).width(newWidth).height(newHeight).css({
      position: 'relative',
      top: (height - newHeight) / 2.0,
      left: (width - newWidth) / 2.0,
    });
  }

  private fitTwoPage() {
    var leftElement: Page.Content.Element;
    var rightElement: Page.Content.Element;
    var $left: JQuery;
    var $right: JQuery;

    // TODO(seikichi): fix me!
    if (this._book.setting().pageDirection() === Setting.PageDirection.L2R) {
      leftElement = this._contents.at(0).element();
      rightElement = this._contents.at(1).element();
    } else {
      leftElement = this._contents.at(1).element();
      rightElement = this._contents.at(0).element();
    }
    $left = $(leftElement);
    $right = $(rightElement);

    var containerWidth = this.$el.width();
    var containerHeight = this.$el.height();

    var leftHeight = leftElement.height;
    var leftWidth = leftElement.width;
    var rightHeight = rightElement.height;
    var rightWidth = rightElement.width;

    var leftScale = 1.0
    var rightScale = leftHeight / rightHeight;

    var width = (leftScale * leftWidth) + (rightScale * rightWidth);
    var height = leftHeight;

    var scale = Math.min(containerWidth / width, containerHeight / height);

    $left
      .width(leftWidth * leftScale * scale)
      .height(leftHeight * leftScale * scale);
    $right
      .width(rightWidth * rightScale * scale)
      .height(rightHeight * rightScale * scale);

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
    book: Book.ModelInterface;
  }
}

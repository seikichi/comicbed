import $ = require('jquery');
import BaseView = require('views/base');
import logger = require('utils/logger');

// models
import Book = require('models/book');
import Setting = require('models/setting');

// exports FlowerpotView
export = InputView;

class InputView extends BaseView {
  // private book: Book.ModelInterface;
  // private template: (data: {[key:string]: any;}) => string;
  // events: {[event:string]:string;};

  // constructor(book: Book.ModelInterface,
  //             template: (data: {[key:string]: any;}) => string) {
  //   this.book = book;
  //   this.template = template;

  //   this.events = {
  //     'click #drop-zone': 'onLeftClick',
  //     'contextmenu': 'onRightClick',
  //     'drop #drop-zone': 'onDrop',
  //     'dragover #drop-zone': 'onDragOver',
  //   };
  //   super();
  // }

  // private onLeftClick() {
  //   this.book.goNextPage();
  // }

  // private onRightClick(event: any) {
  //   event.stopPropagation();
  //   event.preventDefault();
  //   this.book.goPrevPage();
  // }

  // private onDragOver(jqEvent: any) {
  //  var event: DragEvent = jqEvent.originalEvent;
  //   event.stopPropagation();
  //   event.preventDefault();
  // }

  // private onDrop(jqEvent: any) {
  //   var event: DragEvent = jqEvent.originalEvent;
  //   event.stopPropagation();
  //   event.preventDefault();
  //   var files = event.dataTransfer.files;
  //   if (files.length === 0) {
  //     logger.warn('empty file dropped');
  //     return;
  //   }
  //   this.book.openFile(files[0]);
  // }

  // presenter(): string {
  //   return this.template({});
  // }
}


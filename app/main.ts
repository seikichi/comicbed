import $ = require('jquery');
import PDFJS = require('pdfjs');
import Book = require('models/book');
import logger = require('utils/logger');
import Router = require('routers/router');

function main() {
  // setting PDFJS variables
  PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
  // PDFJS.disableWorker = true;
  PDFJS.disableAutoFetch = true;
  PDFJS.disableRange = false;

  $(() => {
    var router = new Router();
    Backbone.history.start();

    var book = Book.create();
    book.openURL('http://localhost:9000/javascript_web_applications.pdf');
    book.on('change:isOpen', () => {
      var image = book.getPageImage(1);
      image.on('change:status', () => {
        var $img = $('<img/>');
        $img.attr({
          src: image.dataURL(),
          width: image.width(),
          height: image.height()
        });
        $('#cover').html($img);
      });
    });
  });
}

export = main;

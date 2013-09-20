import $ = require('jquery');
import PDFJS = require('pdfjs');
import Book = require('models/book');
import logger = require('utils/logger');

function main() {
  // setting PDFJS variables
  PDFJS.workerSrc = 'assets/app/pdfjs/js/pdf.worker.js';
  // PDFJS.disableWorker = true;
  PDFJS.disableAutoFetch = true;
  PDFJS.disableRange = false;

  $(() => {
    $('#drop-zone').on({
      dragover: (jqEvent: any) => {
        var event = <DragEvent>jqEvent.originalEvent;
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }, drop: (jqEvent: any) => {
        var event = <DragEvent>jqEvent.originalEvent;
        event.stopPropagation();
        event.preventDefault();

        var file = event.dataTransfer.files[0];
        var book = Book.create();
        book.openFile(file);
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
      }
    });
  });
}

export = main;

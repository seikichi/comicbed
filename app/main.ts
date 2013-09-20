require.config({
  paths: {
    jquery: '../assets/vendor/jquery/js/jquery',
    underscore: '../assets/vendor/underscore/js/underscore',
    backbone: '../assets/vendor/backbone/js/backbone',
    text: '../assets/vendor/text/js/text',
    handlebars: '../assets/vendor/handlebars/js/handlebars',
    log4javascript: '../assets/vendor/log4javascript/js/log4javascript',
    sprintf: '../assets/vendor/sprintf/js/sprintf',

    pdfjs: '../assets/app/pdfjs/js/pdf',
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    handlebars: {
      exports: 'Handlebars'
    },
    pdfjs: {
      exports: 'PDFJS'
    },
    log4javascript: {
      exports: 'log4javascript'
    },
    sprintf: {
      exports: 'sprintf'
    }
  }
});

require([
  'jquery',
  'models/book',
  'utils/logger',
], (
  $: JQueryStatic,
  Book: any,
  logger: log4javascript.Log4Javascript) => {
    // logger.info('Hello, world!');
    $('#drop-zone').on('dragover', (jqEvent: any) => {
      var event = <DragEvent>jqEvent.originalEvent;
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }).on('drop', (jqEvent: any) => {
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
    });
});

require.config({
  paths: {
    jquery: '../assets/vendor/jquery/js/jquery',
    underscore: '../assets/vendor/underscore/js/underscore',
    backbone: '../assets/vendor/backbone/js/backbone',
    text: '../assets/vendor/text/js/text',
    handlebars: '../assets/vendor/handlebars/js/handlebars',
    log4javascript: '../assets/vendor/log4javascript/js/log4javascript',
    sprintf: '../assets/vendor/sprintf/js/sprintf',
    jqueryui: '../assets/vendor/jquery-ui/js/jquery-ui',

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
    },
    jqueryui: {
      deps: ['jquery'],
      exports: '$'
    },
  }
});

require(['main'], (main: () => void) => { main(); });

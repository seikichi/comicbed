require.config({
  paths: {
    jquery: '../assets/vendor/jquery/js/jquery',
    underscore: '../assets/vendor/underscore/js/underscore',
    backbone: '../assets/vendor/backbone/js/backbone',
    text: '../assets/vendor/text/js/text',
    handlebars: '../assets/vendor/handlebars/js/handlebars',
    log4javascript: '../assets/vendor/log4javascript/js/log4javascript',
    sprintf: '../assets/vendor/sprintf/js/sprintf',
    jsziptools: '../assets/vendor/jsziptools/js/jsziptools.min',
    spin: '../assets/vendor/spin.js/js/spin',
    iscroll: '../assets/vendor/iscroll/js/iscroll-zoom-min',
    promise: '../assets/vendor/bluebird/index',

    pdfjs: '../assets/app/pdfjs/js/pdf',
    unrar: '../assets/app/unrarlib/js/unrar.min',
    tiff: '../assets/app/tiff/js/tiff.min',
    jquerymobile: '../assets/app/jquery-mobile/js/jquery.mobile-1.4.0-beta.1.min',

    dropbox: 'https://www.dropbox.com/static/api/1/dropins',
    gapi: 'https://apis.google.com/js/api',
    gclient: 'https://apis.google.com/js/client',
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
    jquerymobile: {
      deps: ['jquery'],
      exports: '$'
    },
    jsziptools: {
      exports: 'jz'
    },
    iscroll: {
      exports: 'IScroll'
    },
    dropbox: {
      exports: 'Dropbox'
    },
    gapi: {
      exports: 'gapi'
    },
    gclient: {
      exports: 'gapi'
    }
  }
});

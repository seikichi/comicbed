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
    iscroll: '../assets/vendor/iscroll/js/iscroll-min',
    promise: '../assets/vendor/bluebird/index',
    progressbar: '../assets/vendor/bootstrap-progressbar/js/bootstrap-progressbar.min',

    pdfjs: '../assets/app/pdfjs/js/pdf',
    pdfjs_compatibility: '../assets/app/pdfjs/js/compatibility',
    unrar: '../assets/app/unrarlib/js/unrar.min',
    tiff: '../assets/app/tiff/js/tiff.min',
    jquerymobile: '../assets/app/jquery-mobile/js/jquery.mobile-1.4.0-rc.1',

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
    pdfjs_compatibility: {
      exports: 'PDFJS'
    },
    pdfjs: {
      deps: ['pdfjs_compatibility'],
      exports: 'PDFJS'
    },
    log4javascript: {
      exports: 'log4javascript'
    },
    sprintf: {
      exports: 'sprintf'
    },
    jsziptools: {
      exports: 'jz'
    },
    iscroll: {
      exports: 'IScroll'
    },
    progressbar: {
      deps: ['jquery']
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

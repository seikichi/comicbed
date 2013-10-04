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
    jsziptools: '../assets/vendor/jsziptools/js/jsziptools.min',
    spin: '../assets/vendor/spin.js/js/spin',

    pdfjs: '../assets/app/pdfjs/js/pdf',
    unrar: '../assets/app/unrarlib/js/unrar.min',
    tiff: '../assets/app/tiff/js/tiff.min',

    // gapi: 'https://apis.google.com/js/api',
    // gclient: 'https://apis.google.com/js/client',
    gapi: '../assets/app/google/js/api',
    gclient: '../assets/app/google/js/client',
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
    jsziptools: {
      exports: 'jz'
    },
    // unrarlib: {
    //   exports: 'Module'
    // },
    gapi: {
      exports: 'gapi'
    },
    gclient: {
      exports: 'gapi'
    }
  }
});

require(['main'], (main: () => void) => { main(); });

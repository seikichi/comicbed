require.config({
  paths: {
    jquery: '../assets/vendor/jquery/js/jquery',
    underscore: '../assets/vendor/underscore/js/underscore',
    backbone: '../assets/vendor/backbone/js/backbone',
    text: '../assets/vendor/text/js/text',
    handlebars: '../assets/vendor/handlebars/js/handlebars',

    handlebars: '../assets/app/pdfjs/js/pdfjs',
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
    }
  }
});

require([], () => {
  console.log('Hello, world!');
});

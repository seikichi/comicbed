require(['config'], () => {

  var win: any = window;
  win.URL = win.URL || win.webkitURL;

  require(['jquery'], ($: typeof $) => {

    $(document).bind("mobileinit", function(){
      $.mobile.ajaxEnabled = false;
      $.mobile.linkBindingEnabled = false;
      $.mobile.hashListeningEnabled = false;
      $.mobile.pushStateEnabled = false;
    });

    require(['jquerymobile'], (mobile: any) => {
      require([
        'backbone',
        'routers/router'
      ], (
        Backbone: typeof Backbone,
        ComicBedRouter: typeof ComicBedRouter
      ) => {
        var router = new ComicBedRouter();
        Backbone.history.start();
      });
    });
  });
});

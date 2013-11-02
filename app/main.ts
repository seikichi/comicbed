require(['config'], () => {
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
        'promise',
        'routers/router'
      ], (
        Backbone: typeof Backbone,
        Promise: typeof Promise,
        FlowerpotRouter: typeof FlowerpotRouter
      ) => {
        Promise.longStackTraces();
        var router = new FlowerpotRouter();
        Backbone.history.start();
      });
    });
  });
});

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
        'routers/router'
      ], (
        Backbone: typeof Backbone,
        FlowerpotRouter: typeof FlowerpotRouter
      ) => {
        var router = new FlowerpotRouter();
        Backbone.history.start();
      });
    });
  });
});

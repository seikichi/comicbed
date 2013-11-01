// require(['config', 'app'], () => {});

require(['config'], () => {
  require(['jquery'], ($: typeof $) => {

    $(document).bind("mobileinit", function(){
      $.mobile.ajaxEnabled = false;
      $.mobile.linkBindingEnabled = false;
      $.mobile.hashListeningEnabled = false;
      $.mobile.pushStateEnabled = false;
      $.mobile.phonegapNavigationEnabled = true;
      $.mobile.page.prototype.options.domCache = false;
      $.mobile.page.prototype.options.degradeInputs.date = true;
    });

    require(['jquerymobile'], ($: typeof $) => {
      require(['app'], (app: any) => {
      });
    });
  });
});

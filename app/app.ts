import $ = require('jquery');

import Setting = require('models/setting');
import Unarchiver = require('models/unarchiver');
import Reader = require('models/reader');
import Book = require('models/book');
import Scaler = require('models/scaler');
import Screen = require('models/screen');
import Screens = require('collections/screens');

$(() => {
  var $flowerpot = $('#flowerpot');
  $flowerpot.css({'background-color': 'rgb(100, 100, 100)'});
  var size = { width: $flowerpot.width(), height: $flowerpot.height() };
  var setting = Setting.createFromQueryString('');
  var bookFactory = Book.createFactory(Unarchiver.createFactory());
  var scaler = Scaler.create(setting.scalerSetting());
  var screenFactory = Screen.createFactory(scaler, setting.screenSetting());
  var screens = Screens.create(size, screenFactory);

  var reader = Reader.create(bookFactory, screens);
  var currentScreen = reader.screens().currentScreen();
  currentScreen.on('change:status', () => {
    if (currentScreen.status() === Screen.Status.Success) {
      $flowerpot.append(currentScreen.content());
    }
  });
  // var nextScreen0 = reader.screens().nextScreens().at(0);
  // nextScreen0.on('change:status', () => {
  //   if (nextScreen0.status() === Screen.Status.Success) {
  //     // $flowerpot.append(nextScreen0.content());
  //   }
  // });
  reader.openURL('tmp/yuyushiki04.pdf');
});
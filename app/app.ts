import $ = require('jquery');
import IScroll = require('iscroll');

import Setting = require('models/setting');
import Unarchiver = require('models/unarchiver');
import Reader = require('models/reader');
import Book = require('models/book');
import Scaler = require('models/scaler');
import Screen = require('models/screen');
import Cache = require('models/cache');
import Screens = require('collections/screens');

import ScreenView = require('views/screen');
import ScreenCollectionView = require('views/screens');

import templates = require('templates');

enum KeyCode {
  Space = 32,
  Left = 37,
  Up = 38,
  Right = 39,
  Down = 40,
};

$(() => {
  // var URL = 'tmp/yuyushiki04.pdf';
  // var URL = 'tmp/jwa.pdf';
  var URL = 'tmp/lovelab03-04.rar';
  // var URL = 'tmp/firegirl01-B.rar';
  // var URL = 'tmp/firegirl.zip';
  var $flowerpot = $('#flowerpot');

  var size = { width: $flowerpot.width(), height: $flowerpot.height() };
  var setting = Setting.createFromQueryString('');
  var bookFactory = Book.createFactory(Unarchiver.createFactory(setting.unarchiverSetting()));
  var scaler = Scaler.create(setting.scalerSetting());
  // var screenFactory = Screen.createFactory(scaler, setting.screenSetting());
  var screenFactory = Cache.createScreenFactory(
    Screen.createFactory(scaler, setting.screenSetting()),
    setting.screenSetting(),
    setting.cacheSetting());
  var screens = Screens.create(size, screenFactory);

  var reader = Reader.create(bookFactory, screens);
  var view = new ScreenCollectionView({
    el: $flowerpot,
    screens: screens,
    setting: setting.screenSetting(),
    mover: reader,
    template: templates.screens,
  });
  reader.openURL(URL);
  // for debug
  (<any>window).reader = reader;
  $(document).keydown((e: KeyboardEvent) => {
    if (e.keyCode === KeyCode.Left) {
      reader.goNextScreen();
    } else if (e.keyCode === KeyCode.Right) {
      reader.goPrevScreen();
    }
  });
});

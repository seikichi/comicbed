import $ = require('jquery');
import Book = require('models/book');
import Setting = require('models/setting');

export = KeyEventHandler

enum KeyCode {
  Space = 32,
  Left = 37,
  Up = 38,
  Right = 39,
  Down = 40,
};

class KeyEventHandler {
//   private _book: Book.ModelInterface;

//   constructor(book: Book.ModelInterface) {
//     this._book = book;
//     $(document).keydown((e: KeyboardEvent) => { this.keydown(e); });
//   }

//   private keydown(event: KeyboardEvent) {
//     var isL2R = this._book.setting().pageDirection() === Setting.PageDirection.L2R;
//     if ((event.keyCode === KeyCode.Left && !isL2R)
//         || (event.keyCode === KeyCode.Right && isL2R)) {
//       this._book.goNextPage();
//     } else if ((event.keyCode === KeyCode.Left && isL2R)
//                || (event.keyCode === KeyCode.Right && !isL2R)) {
//       this._book.goPrevPage();
//     }

//     if (event.keyCode === KeyCode.Space) {
//       if (this._book.setting().viewMode() === Setting.ViewMode.OnePage) {
//         this._book.setting().setViewMode(Setting.ViewMode.TwoPage);
//       } else {
//         this._book.setting().setViewMode(Setting.ViewMode.OnePage);
//       }
//     }
//   }
}
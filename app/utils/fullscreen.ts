export = fullscreen;

module fullscreen {
  export function toggle(element: HTMLElement) {
    var elem = <any>element;
    var doc = <any>document;
    if (!doc.mozFullScreen && !doc.webkitFullScreen) {
      if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else {
        elem.webkitRequestFullScreen((<any>Element).ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else {
        doc.webkitCancelFullScreen();
      }
    }
  }
}

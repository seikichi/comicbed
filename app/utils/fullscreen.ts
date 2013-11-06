export = fullscreen;

module fullscreen {
  export function isEnabled(): boolean {
    var doc = <any>document;
    return !!(doc.mozFullScreen || doc.webkitIsFullScreen);
  }

  export function toggle(element: HTMLElement) {
    var elem = <any>element;
    var doc = <any>document;
    if (!doc.mozFullScreen && !doc.webkitIsFullScreen) {
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

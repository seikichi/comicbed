export = fullscreen;

module fullscreen {
  export function isSupported(): boolean {
    var doc = <any>document;
    return !!(doc.mozFullScreenEnabled || doc.webkitFullscreenEnabled);
  }

  export function isActive(): boolean {
    var doc = <any>document;
    return !!(doc.mozFullScreen || doc.webkitIsFullScreen);
  }

  export function toggle(element: HTMLElement) {
    var elem = <any>element;
    var doc = <any>document;
    if (!isActive()) {
      if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else {
        elem.webkitRequestFullscreen((<any>Element).ALLOW_KEYBOARD_INPUT);
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

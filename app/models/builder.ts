import Page = require('models/page');

export = Builder;

module Builder {
  export enum PageDirection { L2R, R2L, }

  export interface Content extends HTMLElement {}

  export interface Setting {
    direction(): PageDirection;
  }

  export interface BuildParams {
    width: number;
    height: number;
  }

  export interface Builder {
    build(pages: Page.Content[], params: BuildParams): Content;
  }

  export function create(setting: Setting): Builder {
    return new ContentBulder(setting);
  }
}

// private
class ContentBulder implements Builder.Builder {
  private _setting: Builder.Setting;

  constructor(setting: Builder.Setting) {
    this._setting = setting;
  }

  build(pages: Page.Content[], params: Builder.BuildParams): Builder.Content {
    var div = document.createElement('div');
    for (var i = 0, len = pages.length; i < len; ++i) {
      div.appendChild(pages[i]);
    }
    // TODO(seikichi): set css in here (to pages);
    return div;
  }
}

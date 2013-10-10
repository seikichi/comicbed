import Page = require('models/page');
import Screen = require('models/screen');

export = _Screen;

module _Screen {
  export interface Setting {
    prevScreensNum(): number;
    nextScreensNum(): number;
  }

  export interface Collection {
    length: number;
    at(index: number): Screen.Screen;
    update(pages: Page.Collection, params: Screen.UpdateParams): JQueryPromise<void>;
  }

  export function create(): Collection {
    return undefined;
  }
}

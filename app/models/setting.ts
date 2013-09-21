import Backbone = require('backbone');

import Book = require('models/book');

export = Setting;

module Setting {
  // public
  export interface ModelInterface {
    // getter
    viewMode(): ViewMode;
    pageDirection(): PageDirection;

    isSpreadPage(image: Book.Image.ModelInterface): boolean;
  }
  export enum ViewMode { OnePage, TwoPages, AutoSpread, }
  export enum PageDirection { LeftToRight, RightToLeft, }
  export function create(options: {[key:string]:string;} = {}): ModelInterface {
    return new SettingModel();
  }

  // private
  interface Attribuets {
    viewMode?: ViewMode;
    pageDirection?: PageDirection;
  }

  class SettingModel extends Backbone.Model<Attribuets> implements ModelInterface {
    defaults(): Attribuets {
      return {
        viewMode: ViewMode.OnePage,
        pageDirection: PageDirection.RightToLeft,
      };
    }
    viewMode() { return <ViewMode>this.get('viewMode'); }
    pageDirection() { return <PageDirection>this.get('pageDirection'); }

    isSpreadPage(image: Book.Image.ModelInterface): boolean {
      return image.width() > image.height();
    }
  }
}

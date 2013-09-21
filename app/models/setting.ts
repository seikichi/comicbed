import Backbone = require('backbone');

export = Setting;

module Setting {
  // public
  export interface ModelInterface {
    viewMode(): ViewMode;
    pageDirection(): PageDirection;
  }
  export enum ViewMode { OnePage, TwoPage, AutoSpread, }
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
  }
}

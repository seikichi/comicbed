import Backbone = require('backbone');

export = Setting;

module Setting {
  // public
  export interface ModelInterface {
    viewMode(): ViewMode;
    pageDirection(): PageDirection;
    page(): number;
  }
  export enum ViewMode { OnePage, TwoPage, AutoSpread, }
  export enum PageDirection { L2R, R2L, }
  export function create(options: {[key:string]:string;} = {}): ModelInterface {
    var attributes: Attributes = {};
    if ('viewMode' in options) {
      attributes.viewMode = ViewMode[options['viewMode']];
    }
    if ('pageDirection' in options) {
      attributes.pageDirection = PageDirection[options['pageDirection']];
    }
    if ('page' in options) {
      attributes.page = parseInt(options['page'], 10);
    }
    return new SettingModel(attributes);
  }

  // private
  interface Attributes {
    viewMode?: ViewMode;
    pageDirection?: PageDirection;
    page?: number;
  }

  class SettingModel extends Backbone.Model<Attributes> implements ModelInterface {
    defaults(): Attributes {
      return {
        viewMode: ViewMode.OnePage,
        pageDirection: PageDirection.L2R,
        page: 1,
      };
    }
    constructor(attributes?: Attributes) {
      super(attributes);
    }
    viewMode() { return <ViewMode>this.get('viewMode'); }
    pageDirection() { return <PageDirection>this.get('pageDirection'); }
    page() { return <number>this.get('page'); }
  }
}

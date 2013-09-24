import _ = require('underscore');
import Backbone = require('backbone');
import logger = require('utils/logger');

export = Setting;

module Setting {
  // public
  export enum ViewMode { OnePage, TwoPage, }
  export enum PageDirection { L2R, R2L, }
  export interface ModelInterface {
    // getter
    viewMode(): ViewMode;
    pageDirection(): PageDirection;
    page(): number;
    detectsSpreadPage(): boolean;
    displaysOnlyImageInPdf(): boolean;
    canvasScale(): number;
    // setter
    // TODO (seikichi): refactor these codes by using Typescirpt's property
    setViewMode(mode: ViewMode): void;
    setPageDirection(direction: PageDirection): void;
    setDetectsSpreadPage(value: boolean): void;
    setDisplaysOnlyImageInPdf(value: boolean): void;
    setCanvasScale(scale: number): void;
  }
  export function create(options: {[key:string]:string;} = {}): ModelInterface {
    var attributes: Attributes = {};
    if ('viewMode' in options && options['viewMode'] in ViewMode) {
      attributes.viewMode = ViewMode[options['viewMode']];
    }
    if ('pageDirection' in options && options['pageDirection'] in PageDirection) {
      attributes.pageDirection = PageDirection[options['pageDirection']];
    }
    if ('page' in options && !_.isNaN(parseInt(options['page'], 10))) {
      attributes.page = parseInt(options['page'], 10);
    }
    if ('canvasScale' in options && !_.isNaN(parseFloat(options['canvasScale']))) {
      attributes.canvasScale = parseInt(options['canvasScale'], 10);
    }
    if ('detectsSpreadPage' in options) {
      attributes.detectsSpreadPage = true;
    }
    if ('displaysOnlyImageInPdf' in options) {
      attributes.displaysOnlyImageInPdf = true;
    }
    logger.info('SettingModel is created: attributes:', JSON.stringify(attributes));
    return new SettingModel(attributes);
  }

  // private
  interface Attributes {
    viewMode?: ViewMode;
    pageDirection?: PageDirection;
    page?: number;
    detectsSpreadPage?: boolean;
    displaysOnlyImageInPdf?: boolean;
    canvasScale?: number;
  }

  class SettingModel extends Backbone.Model<Attributes> implements ModelInterface {
    defaults(): Attributes {
      return {
        viewMode: ViewMode.OnePage,
        pageDirection: PageDirection.L2R,
        page: 1,
        detectsSpreadPage: false,
        displaysOnlyImageInPdf: false,
        canvasScale: 1,
      };
    }
    constructor(attributes?: Attributes) {
      super(attributes);
    }
    viewMode() { return <ViewMode>this.get('viewMode'); }
    pageDirection() { return <PageDirection>this.get('pageDirection'); }
    page() { return <number>this.get('page'); }
    detectsSpreadPage() { return <boolean>this.get('detectsSpreadPage'); }
    displaysOnlyImageInPdf() { return <boolean>this.get('displaysOnlyImageInPdf'); }
    canvasScale() { return <number>this.get('canvasScale'); }

    setViewMode(mode: ViewMode): void { this.set('viewMode', mode); }
    setPageDirection(direction: PageDirection): void { this.set('pageDirection', direction); }
    setDetectsSpreadPage(value: boolean): void { this.set('detectsSpreadPage', value); }
    setDisplaysOnlyImageInPdf(value: boolean): void { this.set('displaysOnlyImageInPdf', value); }
    setCanvasScale(scale: number): void { this.set('canvasScale', scale); }
  }
}

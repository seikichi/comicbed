import Promise = require('promise');

export = Picker;

module Picker {
  export interface Result {
    url: string;
    name: string;
    httpHeaders?: {[key:string]:string;};
    mimeType?: string;
  }

  export interface FilePicker {
    pick(): Promise<Result>;
  }
}

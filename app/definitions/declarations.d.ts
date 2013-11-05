declare module "iscroll" {
  export = IScroll;
}

declare class Tiff {
  constructor(buffer: ArrayBuffer);
  toDataURL(): string;
}

declare module "tiff" {
  export = Tiff;
}

interface RarEntry {
  name: string;
  isDirectory(): boolean;
}

declare module "unrar" {
  class Unrar {
    constructor(buffer: ArrayBuffer);
    getEntries(): RarEntry[];
    decompress(filename: string): Uint8Array;
    close(): void;
  }
  export = Unrar;
}

declare module "gapi" {
  export = gapi;
}

declare module "gclient" {
  export = gapi;
}

declare module "spin" {
  export = Spinner;
}

declare module "backbone" {
    export = Backbone;
}

declare module "jqueryui" {
  export = $;
}

declare module "jquerymobile" {
  var mobile: any;
  export = mobile;
}

declare module "progressbar" {
  export = $;
}

declare module "jsziptools" {
  export = jz;
}

declare module "storage" {
    class LocalStorage {
        constructor(name: string);
    }
    export = LocalStorage;
}

interface HTMLTemplate {
  (data: {[key:string]: any;}): string;
}

declare module "templates" {
  var JST: {
    comicbed: HTMLTemplate;
    progress: HTMLTemplate;
    footer: HTMLTemplate;
    header: HTMLTemplate;
    screens: HTMLTemplate;
    screen: HTMLTemplate;
    dialog: HTMLTemplate;
    error: HTMLTemplate;
    help: HTMLTemplate;
    setting: HTMLTemplate;
  };
  export = JST;
}

declare module "unrarlib" {
  var Module: {
    cwrap: (name: string, retType: string, argTypes: string[]) => (...data: any[]) => any;
    FS_createDataFile(parent: string,
                      name: string,
                      data: ArrayBuffer,
                      canRead: boolean,
                      canWrite: boolean): void;
    FS_deleteFile(path: string): void;
    getValue(ptr: number, type: string): number;
    Pointer_stringify(ptr: number): string;

    HEAPU8: Uint8Array;
  };
  export = Module;
}

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

declare module "unrar" {
  class Unrar {
    constructor(buffer: ArrayBuffer);
    getFilenames(): string[];
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
    flowerpot: HTMLTemplate;
    modal: HTMLTemplate;
    progress: HTMLTemplate;
    content: HTMLTemplate;
    footer: HTMLTemplate;
    footercontent: HTMLTemplate;
    header: HTMLTemplate;
    headercontent: HTMLTemplate;
    screens: (data: {[key:string]: any;}) => string;
  };
  export = JST;
}

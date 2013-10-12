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

declare module "tiff" {
  class Tiff {
    constructor(buffer: ArrayBuffer);
    toDataURL(): string;
  }
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

declare module "templates" {
  var JST: {
    flowerpot: (data: {[key:string]: any;}) => string;
    content: (data: {[key:string]: any;}) => string;
    input: (data: {[key:string]: any;}) => string;
    footer: (data: {[key:string]: any;}) => string;
    footercontent: (data: {[key:string]: any;}) => string;
    header: (data: {[key:string]: any;}) => string;
    headercontent: (data: {[key:string]: any;}) => string;

    screens: (data: {[key:string]: any;}) => string;
  };
  export = JST;
}

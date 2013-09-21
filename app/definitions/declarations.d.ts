/// <reference path="./DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="./backbone.d.ts"/>

declare module "backbone" {
    export = Backbone;
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
    imageview: (data: {[key:string]: any;}) => string;
  };
  export = JST;
}

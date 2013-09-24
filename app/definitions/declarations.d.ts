/// <reference path="./DefinitelyTyped/jquery/jquery.d.ts"/>
/// <reference path="./backbone.d.ts"/>

declare module "backbone" {
    export = Backbone;
}

declare module "jqueryui" {
  export = $;
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
  };
  export = JST;
}

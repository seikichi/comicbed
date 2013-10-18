// dropbox chooser

declare module Dropbox {
  export interface ChoosedFile {
    name: string;
    link: string;
    bytes: number;
    icon: string;
    thumbnails: string[];
  }

  export interface ChooserOptions {
    success(files: ChoosedFile[]): void;
    cancel(): void;
    linkType: string;
    multiselect: boolean;
    extensions: string[];
  }

  export function choose(options: ChooserOptions): void;
}


declare module "dropbox" {
  export = Dropbox;
}

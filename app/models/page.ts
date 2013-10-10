export = Page;

module Page {
  export interface Content extends HTMLElement {
    width: number;
    height: number;
  }

  export interface Page {
    name(): string;
    pageNum(): number;
    content(): JQueryPromise<Content>;
  }

  export function createPage(name: string, pageNum: number, content: () => JQueryPromise<Content>)
  : Page {
    return {
      name: () => { return name; },
      pageNum: () => { return pageNum; },
      content: content,
    };
  }
}

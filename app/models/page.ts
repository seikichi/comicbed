export = Page;

module Page {
  export interface Content extends HTMLElement {
    width: number;
    height: number;
  }

  export interface Page {
    name(): string;
    pageNum(): number;
    content(): Promise<Content>;
  }

  export function createPage(name: string, pageNum: number, content: () => Promise<Content>)
  : Page {
    return {
      name: () => { return name; },
      pageNum: () => { return pageNum; },
      content: content,
    };
  }
}

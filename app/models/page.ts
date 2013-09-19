import $ = require('jquery');
import Backbone = require('backbone');

module Page {
  // public
  export interface ModelInterface { }
  export interface CollectionInterface { }
  export interface Attributes {
    name?: string;
    originalPageNum?: number;
  }
  export var createPdfPageCollection: () => CollectionInterface  = () => {
    return new PdfPageCollection();
  }

  // private
  class PdfPageModel extends Backbone.Model<Attributes> implements ModelInterface {
    defaults() {
      return {
        name: 'no page title',
        originalPageNum: 0,
      };
    }
    // TODO
    // loadPageImage(): JQueryDeffered<...>;
  }

  class PdfPageCollection extends Backbone.Collection<PdfPageModel, Attributes>
    implements CollectionInterface {
      constructor(models?: Attributes[], options?: any) {
        this.model = PdfPageModel;
        super(models, options);
      }
  }
}

export = Page;
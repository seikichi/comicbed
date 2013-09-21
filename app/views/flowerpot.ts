import $ = require('jquery');
import templates = require('templates');
import CompositeView = require('views/composite');

export = FlowerpotView;

class FlowerpotView extends CompositeView {
  private template: (data: {[key:string]: any;}) => string;

  constructor(options: {[field:string]:string;}) {
    this.template = templates.flowerpot;
    super({el: '#flowerpot'});
  }

  presenter(): string {
    return this.template({message: 'Hello, world'});
  }
}


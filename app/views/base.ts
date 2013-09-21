import $ = require('jquery');
import Backbone = require('backbone');

export = BaseView;

class BaseView extends Backbone.View {
  constructor(options?: Backbone.ViewOptions) {
    super(options);
  }

  render() {
    this.$el.html(this.presenter());
    return this;
  }

  presenter(): string {
    return '';
  }

  close(): void {
    this.remove();
  }
}

// module BaseView {
//   interface Options {
//     $el: JQuery;
//   }
// }

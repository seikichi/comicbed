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
    this.$el.empty();
    this.stopListening();
    this.undelegateEvents();
    this.el = null;
    this.$el = null;
  }
}


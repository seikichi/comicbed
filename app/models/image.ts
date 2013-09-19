import Backbone = require('backbone');

module Image {
  // public
  export enum Status { success, error, loading, }
  export interface Attribuets {
    status?: Status;
    src?: string;
  }
  export interface ModelInterface {}

  // private
  class ImageModel extends Backbone.Model<Attribuets> implements ModelInterface {
    defaults(): Attribuets {
      return {
        status: Status.loading,
        src: '',
      };
    }
  }
}

export = Image;

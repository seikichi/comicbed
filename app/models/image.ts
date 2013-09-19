import Backbone = require('backbone');

class ImageModel extends Backbone.Model<ImageModel.Attribuets> {
    defaults(): ImageModel.Attribuets {
        return {
            status: ImageModel.Status.loading,
            src: '',
        };
    }
}

module ImageModel {
    export enum Status {
        success,
        error,
        loading,
    }

    export interface Attribuets {
        status?: ImageModel.Status;
        src?: string;
    }
}

export = ImageModel;

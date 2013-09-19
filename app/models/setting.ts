import Backbone = require('backbone');

class SettngModel extends Backbone.Model<SettngModel.Attribuets> {
    defaults() {
        return {};
    }
}

module SettngModel {
    export interface Attribuets {
    }
}

export = SettngModel;
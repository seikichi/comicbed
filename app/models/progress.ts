import Events = require('models/events');
import Backbone = require('backbone');

export = Progress;

module Progress {
  export interface Progression {
    message?: string;
    progress?: number;
    done?: boolean;
  }

  export interface Progress extends Events.Events {
    message(): string;
    progress(): number;
    done(): boolean;

    update(progression: Progression): void;
  }

  export function create(): Progress {
    return new ProgressModel();
  }
}

class ProgressModel extends Backbone.Model implements Progress.Progress {
  defaults() {
    return {
      message: '',
      progress: 0,
      done: false,
    };
  }
  message(): string { return <string>this.get('message'); }
  progress(): number { return <number>this.get('progress'); }
  done(): boolean { return <boolean>this.get('done'); }
  update(progression: Progress.Progression): void { this.set(progression); }
}

export = Events;

module Events {
  export interface Events {
    on(event: string, callback?: (...args: any[]) => void): Events;
    off(eventName?: string, callback?: (...args: any[]) => void): Events;
    once(events: string, callback: (...args: any[]) => void): Events;
  };
}

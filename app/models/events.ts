export = Events;

module Events {
  export interface Events {
    on(event: string, callback?: (...args: any[]) => void, context?: any): Events;
    off(eventName?: string, callback?: (...args: any[]) => void, context?: any): Events;
    once(events: string, callback: (...args: any[]) => void, context?: any): Events;
  };
}

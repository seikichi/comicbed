declare class Promise<T> {
  constructor(resolver: (resolve: (value: T) => void, reject: (reason: any) => void) => void);

  then<U>(fulfilledHandler: (value: T) => Promise<U>,
          rejectedHandler?: (reasson: any) => Promise<U>,
          progressHandler?: (progression: any) => void): Promise<U>;
  then<U>(fulfilledHandler: (value: T) => U,
          rejectedHandler?: (reasson: any) => Promise<U>,
          progressHandler?: (progression: any) => void): Promise<U>;
  then<U>(fulfilledHandler: (value: T) => Promise<U>,
          rejectedHandler?: (reasson: any) => U,
          progressHandler?: (progression: any) => void): Promise<U>;
  then<U>(fulfilledHandler: (value: T) => U,
          rejectedHandler?: (reasson: any) => U,
          progressHandler?: (progression: any) => void): Promise<U>;

  catch<U>(handeler: (reason: any) => Promise<U>): Promise<U>;
  catch<U>(handeler: (reason: any) => U): Promise<U>;
  catch<E, U>(errorClass: { new(...args: any[]): E },
              handeler: (reason: E) => Promise<U>): Promise<U>;
  catch<E, U>(errorClass: { new(...args: any[]): E },
              handeler: (reason: E) => U): Promise<U>;
  caught<U>(handeler: (reason: any) => Promise<U>): Promise<U>;
  caught<U>(handeler: (reason: any) => U): Promise<U>;
  caught<E, U>(errorClass: { new: (...args: any[]) => E },
               handeler: (reason: any) => Promise<U>): Promise<U>;
  caught<E, U>(errorClass: { new: (...args: any[]) => E },
               handeler: (reason: any) => U): Promise<U>;

  finally(handeler: () => void): Promise<T>;
  lastly(handeler: () => void): Promise<T>;

  progressed(handler: (progression: any) => void): Promise<T>;

  done<U>(fulfilledHandler: (value: T) => Promise<U>,
          rejectedHandler?: (reasson: any) => Promise<U>,
          progressHandler?: (progression: any) => void): Promise<U>;
  done<U>(fulfilledHandler: (value: T) => U,
          rejectedHandler?: (reasson: any) => Promise<U>,
          progressHandler?: (progression: any) => void): Promise<U>;
  done<U>(fulfilledHandler: (value: T) => Promise<U>,
          rejectedHandler?: (reasson: any) => U,
          progressHandler?: (progression: any) => void): Promise<U>;
  done<U>(fulfilledHandler: (value: T) => U,
          rejectedHandler?: (reasson: any) => U,
          progressHandler?: (progression: any) => void): Promise<U>;

  // Cancellation
  cancel(): Promise<T>;
  uncancellable(): Promise<T>;
  isCancellable(): boolean;

  fork<U>(fulfilledHandler: (value: T) => Promise<U>,
          rejectedHandler?: (reasson: any) => Promise<U>,
          progressHandler?: (progression: any) => void): Promise<U>;
  fork<U>(fulfilledHandler: (value: T) => U,
          rejectedHandler?: (reasson: any) => Promise<U>,
          progressHandler?: (progression: any) => void): Promise<U>;
  fork<U>(fulfilledHandler: (value: T) => Promise<U>,
          rejectedHandler?: (reasson: any) => U,
          progressHandler?: (progression: any) => void): Promise<U>;
  fork<U>(fulfilledHandler: (value: T) => U,
          rejectedHandler?: (reasson: any) => U,
          progressHandler?: (progression: any) => void): Promise<U>;

  // Synchronous inspection
  inspect(): PromiseInspection<T>;
  isFulfilled(): boolean;
  isRejected(): boolean;
  isPending(): boolean;
  value(): T;
  error(): any;

  static try<T>(fn: () => T): Promise<T>;
  static try<T>(fn: () => Promise<T>): Promise<T>;
  static fulfilled<T>(value: T): Promise<T>;
  static rejected<T>(reason: any): Promise<T>;
  static pending<U>(): PromiseResolver<U>;
  static cast<T>(value: T): Promise<T>;
  static cast<T>(value: Promise<T>): Promise<T>;
  static cast<T>(value: GenericPromise<T>): Promise<T>;

  static is<T>(value: T): boolean;
  static longStackTraces(): void;

  // Collections
  static all<U>(values: Promise[]): Promise<U>;
  static props(object: {[propertyName: string]: Promise<any>})
  : {[propertyName: string]: Promise<any>};
  static settle<U>(values: any[]): Promise<U>;
  static any<U>(values: Promise[]): Promise<U>;
  static some<U>(values: Promise[], count: number): Promise<U>;
  static join<U>(...values: Promise[]): Promise<U>;
  // static spread
  // static map
  // static reduce


  // // Utility
  // call<U>(propertyName: string, ...args: any[]): Promise<U>;
  // get<U>(propertyName: string): Promise<U>;
  // nodeify(callback: (value: T) => void): void;
  // promisify(nodeFunction: any, receiver?: any): any;
  // // ...
}

interface PromiseResolver<T> {
  fulfill(value: T): void;
  reject(reason: any): void;
  progress(value: any): void;
  asCallback: (value: T) => void;
  promise: Promise<T>;
}

interface PromiseInspection<T> {
  isFulfilled(): boolean;
  isRejected(): boolean;
  isPending(): boolean;
  value(): T;
  error(): any;
}

declare module Promise {
  class CancellationError {}
}

interface GenericPromise<T> {
  then<U>(onFulfill: (value: T) => GenericPromise<U>,
          onReject?: (reason: any) => GenericPromise<U>): GenericPromise<U>;
  then<U>(onFulfill: (value: T) => GenericPromise<U>,
          onReject?: (reason: any) => U): GenericPromise<U>;
  then<U>(onFulfill: (value: T) => U,
          onReject?: (reason: any) => GenericPromise<U>): GenericPromise<U>;
  then<U>(onFulfill: (value: T) => U,
          onReject?: (reason: any) => U): GenericPromise<U>;
}

declare module "promise" {
  export = Promise;
}

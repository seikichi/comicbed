export = Task;

class Task<T> implements JQueryPromise<T> {
  private promise: JQueryPromise<T>;
  public canceled: boolean;
  public oncancel: () => void;

  constructor(promise: JQueryPromise<T>) {
    this.promise = promise;
    this.canceled = false;
    this.oncancel = () => {};
  }

  cancel(): void {
    if (this.canceled) { return; }
    this.canceled = true;
    this.oncancel();
  }

  always(...alwaysCallbacks: any[]) { return this.promise.always(alwaysCallbacks); }
  done(...doneCallbacks: any[]) { return this.promise.done(doneCallbacks); }
  fail(...failCallbacks: any[]) { return this.promise.fail(failCallbacks); }
  progress(...progressCallbacks: any[]) { return this.promise.progress(progressCallbacks); }

  then<U>(onFulfill: (value: T) => JQueryPromise<U>,
          onReject?: (...reasons: any[]) => U,
          onProgress?: (...progression: any[]) => any): JQueryPromise<U>;
  then<U>(onFulfill: (value: T) => U,
          onReject?: (...reasons: any[]) => U,
          onProgress?: (...progression: any[]) => any): JQueryPromise<U>;
  then<U>(onFulfill: (value: T) => JQueryPromise<U>,
          onReject?: (...reasons: any[]) => JQueryPromise<U>,
          onProgress?: (...progression: any[]) => any): JQueryPromise<U>;
  then<U>(onFulfill: (value: T) => U,
          onReject?: (...reasons: any[]) => JQueryPromise<U>,
          onProgress?: (...progression: any[]) => any)
  : JQueryPromise<U> {
    return this.promise.then(onFulfill, onReject, onProgress);
  }
}

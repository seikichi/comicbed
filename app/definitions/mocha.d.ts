
declare function describe(title: string, fn: () => void): void;
declare function it(title: string, fn: () => void): void;
declare function it(title: string, fn: (done: () => void) => void): void;
declare module describe {
  function only(title: string, fn: () => void): void;
  function skip(title: string, fn: () => void): void;
}
declare module it {
  function only(title: string, fn: () => void): void;
  function only(title: string, fn: (done: () => void) => void): void;
  function skip(title: string, fn: () => void): void;
  function skip(title: string, fn: (done: () => void) => void): void;
}

declare var suite: typeof describe;
declare var test: typeof it;

declare function before(fn: () => void): void;
declare function before(fn: (done: () => void) => void): void;
declare function after(fn: () => void): void;
declare function after(fn: (done: () => void) => void): void;
declare function beforeEach(fn: () => void): void;
declare function beforeEach(fn: (done: () => void) => void): void;
declare function afterEaach(fn: (done: () => void) => void): void;
declare function afterEaach(fn: () => void): void;

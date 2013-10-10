export = Reader;

module Reader {
  export interface PositionManager {
    currentPageNum(): number;
    totalPageNum(): number;
    goNext(): void;
    goPrev(): void;
    goTo(pageNum: number): void;
    // // events
    // on(event: string, callback: (...args: any[]) => void): void;
    // off(event?: string, callback?: (...args: any[]) => void): void;
    // once(event: string, callback: (...args: any[]) => void): void;
  }
  // export enum ReadingDirection { Forward = +1, Backward = -1 }
}
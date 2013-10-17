interface IScrollPage {
  pageX: number;
  pageY: number;
  x: number;
  y: number;
}

declare class IScroll {
  constructor(el: string, options: IScrollOption);
  constructor(el: HTMLElement, options: IScrollOption);
  destroy(): void;
  resetPosition(time: number): boolean;
  disable(): void;
  enable(): void;
  refresh(): void;

  on(type: string, fn: () => void): void;
  on(type: 'scrollStart', fn: () => void): void;
  on(type: 'scrollEnd', fn: () => void): void;
  on(type: 'flick', fn: () => void): void;
  on(type: 'refresh', fn: () => void): void;
  on(type: 'destroy', fn: () => void): void;
  on(type: 'zoomStart', fn: () => void): void;
  on(type: 'zoomEnd', fn: () => void): void;

  scrollBy(x: number, y: number, time?: number, easing?: string): void;
  scrollTo(x: number, y: number, time: number, easing?: string): void;
  goToPage(x: number, y: number, time?: number, easing?: string): void;
  next(time: number, easing?: string): void;
  prev(time: number, easing?: string): void;

  zoom(scale: number, x?: number, y?: number, time?: number): void;

  currentPage: IScrollPage;
  moved: boolean;
  scale: number;
  options: IScrollOption;
  snapThresholdX: number;
  snapThresholdY: number;
}

interface IScrollOption {
  zoom?: boolean;
  zoomMin?: number;
  zoomMax?: number;
  startZoom?: number;
  mouseWheel?: boolean;
  wheelAction?: string;

  resizeIndicator?: boolean;
  mouseWheelSpeed?: number;
  snapThreshold?: number;
  snap?: boolean;

  startX?: number;
  startY?: number;
  scrollX?: boolean;
  scrollY?: boolean;
  directionLockThreshold?: number;
  momentum?: boolean;

  bounce?: boolean;
  bounceTime?: number;
  bounceEasing?: string;

  preventDefault?: boolean;
  preventDefaultException?: any;

  HWCompositing?: boolean;
  useTransition?: boolean;
  useTransform?: boolean;

  snapSpeed?: number;
}

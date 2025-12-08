import eventsManager, { EventsManager } from "./EventsManager";

export enum SizesEvent {
  Resize = "sizes:resize",
}

export default class Sizes {
  private _width!: number;
  private _height!: number;
  private _pixelRatio!: number;
  private readonly eventsManager: EventsManager = eventsManager;

  constructor() {
    // Setup
    this.setSizes();

    // Resize event
    window.addEventListener("resize", () => {
      this.setSizes();

      this.eventsManager.emit(SizesEvent.Resize);
    });
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get pixelRatio(): number {
    return this._pixelRatio;
  }

  get resolution(): { width: number; height: number } {
    return {
      width: this._width * this._pixelRatio,
      height: this._height * this._pixelRatio,
    };
  }

  private setSizes(): void {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    // this._pixelRatio = Math.min(window.devicePixelRatio, 2);
    this._pixelRatio = 1;
  }
}

import eventsManager, { EventsManager } from "./EventsManager";

export enum TimeEvent {
  Tick = "time:tick",
}

const FIXED_TIMESTEP = 1 / 60;
const MAX_UPDATES_PER_FRAME = 5;

export default class Time {
  private readonly eventsManager: EventsManager = eventsManager;
  private _elapsed: number; // time in milliseconds elapsed since the start of the game
  private _timeBuffer = 0; // in seconds

  constructor() {
    this._elapsed = performance.now();

    this.tick = this.tick.bind(this);

    window.requestAnimationFrame(this.tick);
  }

  get elapsed(): number {
    return this._elapsed;
  }

  get delta(): number {
    return FIXED_TIMESTEP;
  }

  private tick(now: number): void {
    let delta = (now - this._elapsed) / 1000;
    this._elapsed = now;

    // Limiting too large time delta (lag protection). It works like a game pause
    if (delta > 0.25) {
      console.warn("to big delta", delta);
      delta = 0.25;
    }

    this._timeBuffer += delta;

    if (this._timeBuffer < FIXED_TIMESTEP) {
      window.requestAnimationFrame(this.tick);
      return;
    }

    let updates = 0; // updates on current frame

    while (this._timeBuffer >= FIXED_TIMESTEP) {
      this.eventsManager.emit(TimeEvent.Tick);
      this._timeBuffer -= FIXED_TIMESTEP;
      updates++;

      if (updates > MAX_UPDATES_PER_FRAME) {
        console.error(
          "Update loop can't keep up! Max updates per frame: ",
          MAX_UPDATES_PER_FRAME,
        );
        break;
      }
    }

    window.requestAnimationFrame(this.tick);
  }
}

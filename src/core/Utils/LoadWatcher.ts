import { EventDispatcher } from "three";

export class Watchable extends EventDispatcher<{ loaded: {} }> {}

export class LoadWatcher {
  private toWatch: Set<Watchable>;
  private loadedSet: Set<Watchable> = new Set();
  private callback: () => void;

  constructor(watchables: Watchable[], onComplete: () => void) {
    this.toWatch = new Set(watchables);
    this.callback = onComplete;

    for (const item of watchables) {
      item.addEventListener("loaded", () => {
        this.loadedSet.add(item);
        this.checkAllLoaded();
      });
    }
  }

  private checkAllLoaded() {
    if (this.loadedSet.size === this.toWatch.size) {
      this.callback();
    }
  }
}

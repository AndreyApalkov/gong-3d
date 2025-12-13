import { Theme } from "../ThemeManager";
import eventsManager, { EventsManager } from "../Utils/EventsManager";
import { GongEvent } from "../World/Gong";
import { WinterTheme } from "./WinterTheme";

export class NewYearTheme extends WinterTheme implements Theme {
  private readonly eventsManager: EventsManager = eventsManager;
  private readonly sound: HTMLAudioElement = new Audio(
    "sound/jingle-bells-orchestra.mp3",
  );
  constructor() {
    super();

    this.playSound = this.playSound.bind(this);
  }

  apply(): void {
    super.apply();
    this.world?.christmasTree?.setVisible(true);
    this.environment?.setTimeOfDay("night");
    this.eventsManager.on(GongEvent.Hit, this.playSound);
  }

  discard(): void {
    super.discard();
    this.world?.christmasTree?.setVisible(false);
    this.stopSound();
    this.eventsManager.off(GongEvent.Hit, this.playSound);
  }

  private playSound(): void {
    this.sound.volume = 1;
    this.sound.play();
  }

  private stopSound(): void {
    this.sound.pause();
    this.sound.currentTime = 0;
  }
}

import Experience from "../Experience";
import { Textures } from "../sources";
import { Theme } from "../ThemeManager";
import Environment from "../World/Environment";
import World from "../World/World";

export class WinterTheme implements Theme {
  protected world?: World;
  protected environment?: Environment;
  private readonly ambientSound: HTMLAudioElement = new Audio(
    "sound/wind-outside-sound-ambient.mp3",
  );

  constructor() {
    const experience = new Experience();
    this.world = experience.world;
    this.environment = this.world?.environment;

    this.playAmbientSound = this.playAmbientSound.bind(this);
  }

  apply(): void {
    this.world?.floor?.setTextures([
      Textures.SnowFloorColor,
      Textures.SnowFloorNormal,
      Textures.SnowFloorDisplacement,
      Textures.SnowFloorRoughness,
      Textures.SnowFloorAO,
    ]);
    this.environment?.toggleSnow(true);
    this.environment?.setTimeOfDay("morning");
    this.playAmbientSound();
    document.addEventListener("click", this.playAmbientSound, { once: true });
  }

  discard(): void {
    this.environment?.toggleSnow(false);
    this.stopAmbientSound();
    document.removeEventListener("click", this.playAmbientSound);
  }

  private playAmbientSound(): void {
    this.ambientSound.loop = true;
    this.ambientSound.volume = 0.5;
    this.ambientSound.play();
  }

  private stopAmbientSound(): void {
    this.ambientSound.pause();
    this.ambientSound.currentTime = 0;
  }
}

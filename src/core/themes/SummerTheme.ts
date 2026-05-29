import Experience from "../Experience";
import { Textures } from "../sources";
import { Theme } from "../ThemeManager";
import Environment from "../World/Environment";
import World from "../World/World";

export class SummerTheme implements Theme {
  private world?: World;
  private environment?: Environment;
  private readonly ambientSound: HTMLAudioElement = new Audio(
    "sound/soundsforyou-ocean-sea-soft-waves.mp3",
  );

  constructor() {
    const experience = new Experience();
    this.world = experience.world;
    this.environment = this.world?.environment;

    this.playAmbientSound = this.playAmbientSound.bind(this);
  }

  apply(): void {
    this.world?.floor?.setTextures([
      Textures.SandFloorColor,
      Textures.SandFloorNormal,
      Textures.SandFloorDisplacement,
      Textures.SandFloorRoughness,
      Textures.SandFloorAO,
    ]);
    this.environment?.setTimeOfDay("day");
    this.world?.palm?.setVisible(true);
    this.playAmbientSound();
    document.addEventListener("click", this.playAmbientSound, { once: true });
  }

  discard(): void {
    this.world?.palm?.setVisible(false);
    this.stopAmbientSound();
    document.removeEventListener("click", this.playAmbientSound);
  }

  private playAmbientSound(): void {
    this.ambientSound.loop = true;
    this.ambientSound.volume = 0.2;
    this.ambientSound.play();
  }

  private stopAmbientSound(): void {
    this.ambientSound.pause();
    this.ambientSound.currentTime = 0;
  }
}

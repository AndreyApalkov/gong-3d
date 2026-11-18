import Experience from "../Experience";
import { SoundAsset } from "../sources";
import { Theme } from "../ThemeManager";
import { WinterTheme } from "./WinterTheme";

export class NewYearTheme extends WinterTheme implements Theme {
  private readonly experience: Experience;

  constructor() {
    super();

    this.experience = new Experience();
  }

  apply(): void {
    super.apply();
    this.experience.world?.gramophone?.setSong(SoundAsset.JingleBells);
    this.world?.christmasTree?.setVisible(true);
    this.environment?.setTimeOfDay("night");
  }

  discard(): void {
    super.discard();
    this.world?.christmasTree?.setVisible(false);
  }
}

import Experience from "../Experience";
import { Textures } from "../sources";
import { Theme } from "../ThemeManager";
import Environment from "../World/Environment";
import World from "../World/World";

export class NewYearTheme implements Theme {
  private world?: World;
  private environment?: Environment;

  constructor() {
    const experience = new Experience();
    this.world = experience.world;
    this.environment = this.world?.environment;
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
    this.world?.christmasTree?.setVisible(true);
  }

  discard(): void {
    this.environment?.toggleSnow(false);
    this.world?.christmasTree?.setVisible(false);
  }
}

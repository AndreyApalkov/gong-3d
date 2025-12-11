import Experience from "../Experience";
import { Textures } from "../sources";
import { Theme } from "../ThemeManager";
import Environment from "../World/Environment";
import World from "../World/World";

export class DefaultTheme implements Theme {
  private world?: World;
  private environment?: Environment;

  constructor() {
    const experience = new Experience();
    this.world = experience.world;
    this.environment = this.world?.environment;
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
  }

  discard(): void {
    console.log("Discarding Default Theme");
  }
}

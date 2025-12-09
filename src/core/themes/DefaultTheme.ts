import Experience from "../Experience";
import { Textures } from "../sources";
import { Theme } from "../ThemeManager";
import World from "../World/World";

export class DefaultTheme implements Theme {
  private world?: World;

  constructor() {
    const experience = new Experience();
    this.world = experience.world;
  }

  apply(): void {
    this.world?.floor?.setTextures([
      Textures.SandFloorColor,
      Textures.SandFloorNormal,
      Textures.SandFloorDisplacement,
      Textures.SandFloorRoughness,
      Textures.SandFloorAO,
    ]);
  }

  discard(): void {
    console.log("Discarding Default Theme");
  }
}

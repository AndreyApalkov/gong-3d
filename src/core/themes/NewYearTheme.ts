import { Theme } from "../ThemeManager";
import { WinterTheme } from "./WinterTheme";

export class NewYearTheme extends WinterTheme implements Theme {
  constructor() {
    super();
  }

  apply(): void {
    super.apply();
    this.world?.christmasTree?.setVisible(true);
  }

  discard(): void {
    super.discard();
    this.world?.christmasTree?.setVisible(false);
  }
}

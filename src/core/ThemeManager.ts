import Experience from "./Experience";
import { DefaultTheme } from "./themes/DefaultTheme";
import { NewYearTheme } from "./themes/NewYearTheme";
import { WinterTheme } from "./themes/WinterTheme";
import Debug from "./Utils/Debug";

export interface Theme {
  apply(): void;
  discard(): void;
}

export enum ThemeName {
  Default = "default",
  Winter = "winter",
  NewYear = "newYear",
}

export class ThemeManager {
  private readonly themeLoaders: Record<ThemeName, Theme> = {
    [ThemeName.Default]: new DefaultTheme(),
    [ThemeName.NewYear]: new NewYearTheme(),
    [ThemeName.Winter]: new WinterTheme(),
  };
  public currentThemeName: ThemeName = ThemeName.Winter;
  private currentTheme?: Theme;

  constructor(private debug: Debug = new Experience().debug) {
    this.setTheme(this.currentThemeName);

    if (this.debug.active) {
      this.setDebug();
    }
  }

  private setDebug(): void {
    const folder = this.debug.ui?.addFolder("Theming");

    folder
      ?.add(this, "currentThemeName", ThemeName)
      .name("Theme")
      .onChange((value: ThemeName) => this.setTheme(value));
  }

  public async setTheme(themeName: ThemeName): Promise<void> {
    if (this.currentTheme) {
      this.currentTheme.discard();
    }

    this.currentTheme = this.themeLoaders[themeName];
    if (!this.currentTheme) {
      console.warn(`Theme ${themeName} not found`);
      return;
    }

    this.currentTheme.apply();
  }
}

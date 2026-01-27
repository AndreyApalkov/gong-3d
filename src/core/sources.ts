export enum Textures {
  Snowflake = "textures/sprites/snowflake.png",
  EnvironmentNight = "textures/kloofendal_48d_partly_cloudy_puresky_1k.exr",
  SnowFloorColor = "textures/floor/snow_1/color.jpg",
  SnowFloorNormal = "textures/floor/snow_1/normal.jpg",
  SnowFloorDisplacement = "textures/floor/snow_1/displacement.png",
  SnowFloorRoughness = "textures/floor/snow_1/roughness.jpg",
  SnowFloorAO = "textures/floor/snow_1/ao.jpg",
  SandFloorColor = "textures/floor/sand/color.jpg",
  SandFloorNormal = "textures/floor/sand/normal.jpg",
  SandFloorDisplacement = "textures/floor/sand/displacement.png",
  SandFloorRoughness = "textures/floor/sand/roughness.jpg",
  SandFloorAO = "textures/floor/sand/ao.jpg",
  BaulkColor = "textures/baulk/color.jpg",
  BaulkNormal = "textures/baulk/normal.jpg",
  GongPlateColor = "textures/gong-plate-7/color.jpg",
  GongPlateNormal = "textures/gong-plate-7/normal.jpg",
  GongPlateMetallic = "textures/gong-plate-7/metallic.jpg",
  GongPlateRoughness = "textures/gong-plate-7/roughness.jpg",
  GongPlateAO = "textures/gong-plate-7/ambientOcclusion.jpg",
  Logo = "textures/logo/casechek-logo.png",
  NightSky = "textures/environment/stars_milky_way_8k.jpg",
}

export enum Models {
  Arms = "models/arms.glb",
  Mallet = "models/mallet.glb",
  ChristmasTree = "models/christmas_tree.glb",
  Gramphone = "models/gramophone.glb",
}

export enum SoundAsset {
  song = "sound/Mentallica.mp3",
}

export const texturesToPreload: string[] = [
  Textures.Snowflake,
  Textures.EnvironmentNight,
  Textures.SnowFloorColor,
  Textures.SnowFloorNormal,
  Textures.SnowFloorDisplacement,
  Textures.SnowFloorRoughness,
  Textures.SnowFloorAO,
  Textures.SandFloorColor,
  Textures.SandFloorNormal,
  Textures.SandFloorDisplacement,
  Textures.SandFloorRoughness,
  Textures.SandFloorAO,
  Textures.BaulkColor,
  Textures.BaulkNormal,
  Textures.GongPlateColor,
  Textures.GongPlateNormal,
  Textures.GongPlateMetallic,
  Textures.GongPlateRoughness,
  Textures.GongPlateAO,
  Textures.Logo,
  Textures.NightSky,
];

export const modelsToPreload: string[] = [
  Models.Arms,
  Models.Mallet,
  Models.ChristmasTree,
  Models.Gramphone,
];

export const soundsToPreload: SoundAsset[] = [SoundAsset.song];

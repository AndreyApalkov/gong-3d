import { PositionalAudio, AudioListener } from "three";
import Experience from "../Experience";
import { SoundAsset } from "../sources";
import Resources from "./Resources";

export class AudioManager {
  private readonly audioListener: AudioListener;
  private readonly resources: Resources;

  constructor() {
    const experience = new Experience();

    this.audioListener = experience.audioListener;
    this.resources = experience.resources;
  }

  async createPositionalAudio(
    soundPath: SoundAsset,
  ): Promise<PositionalAudio | undefined> {
    const buffer = await this.resources.getAudio(soundPath);
    const audio = new PositionalAudio(this.audioListener);

    if (!buffer) {
      console.error(`Audio buffer for ${soundPath} not found`);
      return undefined;
    }
    audio.setBuffer(buffer);
    audio.setRefDistance(10);
    audio.setMaxDistance(150);

    return audio;
  }

  async createPositionalAudios(
    soundPaths: SoundAsset[],
  ): Promise<PositionalAudio[]> {
    const audios: PositionalAudio[] = [];

    for (const soundPath of soundPaths) {
      const audio = await this.createPositionalAudio(soundPath);
      if (audio) {
        audios.push(audio);
      }
    }

    return audios;
  }
}

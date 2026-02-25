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

  async createPositionalAudioBySoundAsset(
    soundPath: SoundAsset,
  ): Promise<PositionalAudio | undefined> {
    const buffer = await this.resources.getAudio(soundPath);

    if (!buffer) {
      console.error(`Audio buffer for ${soundPath} not found`);
      return undefined;
    }

    return this.createPositionalAudio(buffer);
  }

  async createPositionalAudioFromBuffer(
    arrayBuffer: ArrayBuffer,
  ): Promise<PositionalAudio | undefined> {
    const audioContext = this.audioListener.context;

    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    return this.createPositionalAudio(audioBuffer);
  }

  async createPositionalAudiosBySoundAssets(
    soundPaths: SoundAsset[],
  ): Promise<PositionalAudio[]> {
    const audios: PositionalAudio[] = [];

    for (const soundPath of soundPaths) {
      const audio = await this.createPositionalAudioBySoundAsset(soundPath);
      if (audio) {
        audios.push(audio);
      }
    }

    return audios;
  }

  private createPositionalAudio(
    audioBuffer: AudioBuffer,
  ): PositionalAudio | undefined {
    const audio = new PositionalAudio(this.audioListener);

    audio.setBuffer(audioBuffer);
    audio.setRefDistance(10);
    audio.setMaxDistance(150);

    return audio;
  }
}

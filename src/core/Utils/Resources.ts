import * as THREE from "three";
import { EXRLoader, GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import eventsManager, { EventsManager } from "./EventsManager";
import { SoundAsset } from "../sources";

export enum ResourcesEvent {
  Ready = "resources:ready",
  LoadingProgress = "resources:loading-progress",
}

interface Loaders {
  texture: THREE.TextureLoader;
  exr: EXRLoader;
  gltf: GLTFLoader;
  audioLoader: THREE.AudioLoader;
}

export default class Resources {
  private readonly loadingManager: THREE.LoadingManager;
  private readonly loaders: Loaders;
  private readonly eventsManager: EventsManager = eventsManager;
  private readonly modelCache: Map<string, GLTF> = new Map();
  private readonly textureCache: Map<string, THREE.Texture> = new Map();
  private readonly loadingModels: Map<string, Promise<GLTF | undefined>> =
    new Map();
  private readonly loadingTextures: Map<
    string,
    Promise<THREE.Texture | undefined>
  > = new Map();
  private readonly audioCache: Map<SoundAsset, AudioBuffer> = new Map();
  private readonly loadingAudios: Map<
    SoundAsset,
    Promise<AudioBuffer | undefined>
  > = new Map();

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.loaders = {
      texture: new THREE.TextureLoader(this.loadingManager),
      exr: new EXRLoader(this.loadingManager),
      gltf: new GLTFLoader(this.loadingManager),
      audioLoader: new THREE.AudioLoader(this.loadingManager),
    };

    this.listenLoadingEvents();
  }

  loadTexture(path: string): Promise<THREE.Texture | undefined> {
    if (this.textureCache.has(path)) {
      const texture = this.textureCache.get(path);
      return Promise.resolve(texture);
    }

    if (this.loadingTextures.has(path)) {
      return this.loadingTextures.get(path)!;
    }

    const loader = path.endsWith(".exr")
      ? this.loaders.exr
      : this.loaders.texture;

    const texturePromise = new Promise<THREE.Texture | undefined>((resolve) => {
      loader.load(
        path,
        (file) => {
          this.textureCache.set(path, file);
          this.loadingTextures.delete(path);
          resolve(file);
        },
        (_: ProgressEvent) => {},
        (error: any) => {
          console.error("Load texture error:", error);
          this.loadingTextures.delete(path);
          resolve(undefined);
        },
      );
    });

    this.loadingTextures.set(path, texturePromise);
    return texturePromise;
  }

  loadTextures(paths: string[]): Promise<Array<THREE.Texture | undefined>> {
    return Promise.all(paths.map((path) => this.loadTexture(path)));
  }

  getTexture(path: string): THREE.Texture | undefined {
    return this.textureCache.get(path);
  }

  getTextures(paths: string[]): Array<THREE.Texture | undefined> {
    return paths.map((path) => this.getTexture(path));
  }

  loadModel(path: string): Promise<GLTF | undefined> {
    if (this.modelCache.has(path)) {
      const model = this.modelCache.get(path);
      return Promise.resolve(model);
    }

    if (this.loadingModels.has(path)) {
      return this.loadingModels.get(path)!;
    }

    const modelPromise = new Promise<GLTF | undefined>((resolve) => {
      this.loaders.gltf.load(
        path,
        (file) => {
          this.modelCache.set(path, file);
          this.loadingModels.delete(path);
          resolve(file);
        },
        (_: ProgressEvent) => {},
        (error) => {
          console.error("Load GLTF modle error:", error);
          this.loadingModels.delete(path);
          resolve(undefined);
        },
      );
    });

    this.loadingModels.set(path, modelPromise);
    return modelPromise;
  }

  loadModels(paths: string[]): Promise<Array<GLTF | undefined>> {
    return Promise.all(paths.map((path) => this.loadModel(path)));
  }

  getModel(path: string): GLTF | undefined {
    return this.modelCache.get(path);
  }

  async loadAudio(path: SoundAsset): Promise<AudioBuffer | undefined> {
    if (this.audioCache.has(path)) {
      const audio = this.audioCache.get(path);
      return audio;
    }

    if (this.loadingAudios.has(path)) {
      return this.loadingAudios.get(path)!;
    }

    const audioPromise = new Promise<AudioBuffer | undefined>((resolve) => {
      this.loaders.audioLoader.load(
        path,
        (file) => {
          this.audioCache.set(path, file);
          this.loadingAudios.delete(path);
          resolve(file);
        },
        (_: ProgressEvent) => {},
        (error) => {
          console.error("Load Audio error:", error);
          this.loadingAudios.delete(path);
          resolve(undefined);
        },
      );
    });

    this.loadingAudios.set(path, audioPromise);
    return audioPromise;
  }

  loadAudios(paths: SoundAsset[]): Promise<Array<AudioBuffer | undefined>> {
    return Promise.all(paths.map((path) => this.loadAudio(path)));
  }

  async getAudio(path: SoundAsset): Promise<AudioBuffer | undefined> {
    const audio = this.audioCache.get(path);
    if (!audio) {
      console.log(`Audio not found in cache, start loading: ${path}`);
      return this.loadAudio(path);
    }
    return audio;
  }

  private listenLoadingEvents(): void {
    this.loadingManager.onLoad = () => {
      this.eventsManager.emit(ResourcesEvent.Ready);
    };
    this.loadingManager.onProgress = (_: string, loaded, total) => {
      const progress = loaded / total;
      this.eventsManager.emit(ResourcesEvent.LoadingProgress, progress);
    };
  }
}

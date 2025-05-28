import * as THREE from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";
import eventsManager, { EventsManager } from "./EventsManager";

export enum ResourcesEvent {
  Ready = "resources:ready",
  LoadingProgress = "resources:loading-progress",
}

interface Loaders {
  texture: THREE.TextureLoader;
  gltfLoader: GLTFLoader;
}

export default class Resources {
  private readonly loadingManager: THREE.LoadingManager;
  private readonly loaders: Loaders;
  private readonly eventsManager: EventsManager = eventsManager;
  private readonly modelCache: Map<string, GLTF> = new Map();
  private readonly loadingModels: Map<string, Promise<GLTF | undefined>> =
    new Map();

  constructor() {
    this.loadingManager = new THREE.LoadingManager();
    this.loaders = {
      texture: new THREE.TextureLoader(this.loadingManager),
      gltfLoader: new GLTFLoader(this.loadingManager),
    };

    this.listenLoadingEvents();
  }

  loadTexture(path: string): Promise<THREE.Texture | undefined> {
    return new Promise((resolve) => {
      // TODO: consider caching if necessary
      this.loaders.texture.load(
        path,
        (file) => {
          resolve(file);
        },
        (_: ProgressEvent) => {},
        (error: any) => {
          console.error("Load texture error:", error);
          resolve(undefined);
        },
      );
    });
  }

  loadTextures(paths: string[]): Promise<Array<THREE.Texture | undefined>> {
    return Promise.all(paths.map((path) => this.loadTexture(path)));
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
      this.loaders.gltfLoader.load(
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

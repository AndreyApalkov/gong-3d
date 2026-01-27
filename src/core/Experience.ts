import * as THREE from "three";
import Stats from "stats.js";
import Sizes, { SizesEvent } from "./Utils/Sizes";
import Time, { TimeEvent } from "./Utils/Time";
import Camera from "./Camera";
import Renderer from "./Renderer";
import World from "./World/World";
import Resources, { ResourcesEvent } from "./Utils/Resources";
import Debug from "./Utils/Debug";
import eventsManager, { EventsManager } from "./Utils/EventsManager";
import PhysicalWorld from "./PhysicalWorld";
import Player from "./World/Player";
import PlayerInputHandler from "./PlayerInputHandler";
import { modelsToPreload, soundsToPreload, texturesToPreload } from "./sources";
import { ThemeManager } from "./ThemeManager";
import { CollisionManager } from "./CollisionManager";

let instance: Experience;

export default class Experience {
  public readonly canvas!: HTMLCanvasElement;
  public readonly debug!: Debug;
  public readonly sizes!: Sizes;
  public readonly time!: Time;
  public readonly scene!: THREE.Scene;
  public readonly resources!: Resources;
  public readonly camera!: Camera;
  public readonly audioListener = new THREE.AudioListener();
  public readonly renderer!: Renderer;
  public readonly physicalWorld!: PhysicalWorld;
  public readonly collisionManager!: CollisionManager;
  private readonly eventsManager: EventsManager = eventsManager;
  private player?: Player;
  public world?: World;

  private stats?: Stats;

  constructor() {
    if (instance) {
      return instance;
    }

    // window.experience = this;

    instance = this;
    // Options
    this.canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;

    // Setup
    this.debug = new Debug();
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.resources = new Resources();
    this.camera = new Camera();
    this.camera.instance.add(this.audioListener);
    this.renderer = new Renderer();
    this.physicalWorld = new PhysicalWorld();
    this.collisionManager = new CollisionManager();

    // this.scene.fog = new THREE.Fog(0xf9efa9, 0, 200);
    this.resources.loadModels(modelsToPreload);
    this.resources.loadTextures(texturesToPreload);
    this.resources.loadAudios(soundsToPreload);

    // Sizes resize event
    this.eventsManager.on(SizesEvent.Resize, () => {
      this.resize();
    });

    this.eventsManager.on(ResourcesEvent.Ready, () => {
      this.world = new World();
      this.player = new Player();
      new PlayerInputHandler(this.player);
      new ThemeManager();
    });

    // Time tick event
    this.eventsManager.on(TimeEvent.Tick, () => {
      this.update();
    });

    if (this.debug.active) {
      this.setDebug();
    }
  }

  destroy(): void {
    this.eventsManager.off(SizesEvent.Resize);
    this.eventsManager.off(TimeEvent.Tick);

    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();

        for (const key in child.material) {
          const value = child.material[key];

          if (value && typeof value.dispose === "function") {
            value.dispose();
          }
        }
      }
    });

    this.camera.dispose();
    this.renderer.dispose();

    if (this.debug.active) {
      this.debug.destroy();
    }
  }

  private resize(): void {
    this.camera.resize();
    this.renderer.resize();
  }

  private update(): void {
    if (this.debug.active) {
      this.stats?.begin();
    }
    this.physicalWorld.update();
    this.collisionManager.checkCollisions();
    // this.camera.update();
    this.world?.update();
    this.player?.update();
    this.renderer.update();
    if (this.debug.active) {
      this.stats?.end();
    }
  }

  private setDebug(): void {
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);
  }
}

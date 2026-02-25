import {
  AnimationAction,
  AnimationMixer,
  Box3,
  Group,
  Object3D,
  Object3DEventMap,
  PositionalAudio,
  Vector3,
} from "three";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import { GLTF } from "three/examples/jsm/Addons.js";
import { Models, SoundAsset } from "../sources";
import PhysicalEntity from "../models/PhysicalEntity";
import Time from "../Utils/Time";
import eventsManager, { EventsManager } from "../Utils/EventsManager";
import { GongEvent } from "./Gong";
import { AudioManager } from "../Utils/AudioManager";
import { ActiveEvents, type TempContactForceEvent } from "@dimforge/rapier3d";
import { CollisionManager } from "../CollisionManager";
import Debug from "../Utils/Debug";

export class Gramophone {
  private readonly eventsManager: EventsManager = eventsManager;
  private readonly resources: Resources;
  private readonly time: Time;
  private readonly audioManager: AudioManager;
  private readonly collisionManager: CollisionManager;
  private readonly debug: Debug;
  private model?: GLTF;
  private gramophone?: PhysicalEntity;
  private animationMixer?: AnimationMixer;
  private animation?: AnimationAction;
  private song?: PositionalAudio;
  private hitSounds: PositionalAudio[] = [];
  private fileInput!: HTMLInputElement;

  constructor(private position: Vector3 = new Vector3(0, 0, 0)) {
    const experience = new Experience();

    this.resources = experience.resources;
    this.time = experience.time;
    this.audioManager = experience.audioManager;
    this.collisionManager = experience.collisionManager;
    this.debug = experience.debug;

    this.setupModel();
    this.setupAudio();
    this.createAudioInput();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  update(): void {
    this.gramophone?.update();

    this.animationMixer?.update(this.time.delta);
  }

  private setupModel(): void {
    this.model = this.resources.getModel(Models.Gramphone);

    if (this.model) {
      this.model.scene.scale.setScalar(0.01);

      const group = new Group();
      group.add(this.model.scene);
      this.model.scene.rotateY(Math.PI);

      this.animationMixer = new AnimationMixer(
        this.model.scene as unknown as Object3D<Object3DEventMap>,
      );

      this.model.animations.forEach((clip) => {
        this.animation = this.animationMixer!.clipAction(clip);
      });

      const boundingBox = new Box3().setFromObject(this.model.scene);
      const size = new Vector3();
      boundingBox.getSize(size);

      this.gramophone = new PhysicalEntity({
        shape: { type: "box", sizes: { x: size.x, y: size.y, z: size.z } },
        rigidBodyType: "dynamic",
        position: {
          x: this.position.x,
          y: this.position.y,
          z: this.position.z,
        },
        friction: 1,
        density: 1,
        mesh: group,
      });

      this.gramophone.collider.setActiveEvents(
        ActiveEvents.CONTACT_FORCE_EVENTS,
      );

      this.collisionManager.registerContactForceHandler(
        this.gramophone.collider.handle,
        this.handleGramophoneCollision,
      );
    }
  }

  private async setupAudio(): Promise<void> {
    this.hitSounds =
      await this.audioManager.createPositionalAudiosBySoundAssets([
        SoundAsset.MetalHit1,
        SoundAsset.MetalHit2,
        SoundAsset.MetalHit3,
      ]);

    this.song = await this.audioManager.createPositionalAudioBySoundAsset(
      SoundAsset.MentallicaSong,
    );

    if (this.song) {
      this.gramophone?.mesh.add(this.song);
      this.eventsManager.on(GongEvent.Hit, this.playSong);
    }
  }

  private playSong = (): void => {
    this.animation?.play();

    if (this.song) {
      this.song.play();
      this.song.onEnded = () => {
        this.animation?.stop();
      };
    }
  };

  private handleGramophoneCollision = (event: TempContactForceEvent): void => {
    const force = event.maxForceMagnitude();
    if (force < 250) return;

    const randomIndex = Math.floor(Math.random() * this.hitSounds.length);
    const randomSound: PositionalAudio = this.hitSounds[randomIndex];

    if (randomSound.isPlaying) return;

    randomSound.setVolume(Math.min(0.2 + force / 1000, 0.7));
    randomSound.play();
  };

  private setDebug(): void {
    const folder = this.debug.ui?.addFolder("Gramophone");

    folder?.add(this, "loadSong").name("Load Song");
  }

  private loadSong = async (): Promise<void> => {
    this.fileInput.click();
  };

  private createAudioInput(): void {
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = "audio/*";
    this.fileInput.style.display = "none";
    document.body.appendChild(this.fileInput);

    this.fileInput.addEventListener("change", async () => {
      const file = this.fileInput.files?.[0];
      if (!file) return;

      const arrayBuffer = await file.arrayBuffer();

      this.song?.stop();
      this.song =
        await this.audioManager.createPositionalAudioFromBuffer(arrayBuffer);
      this.song?.setVolume(1);
      this.song?.setRefDistance(30);
    });
  }
}

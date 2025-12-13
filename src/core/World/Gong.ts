import * as THREE from "three";
import Entity from "../models/Entity";
import PhysicalEntity from "../models/PhysicalEntity";
import Resources from "../Utils/Resources";
import Experience from "../Experience";
import PhysicalWorld from "../PhysicalWorld";
import {
  ActiveEvents,
  type RevoluteImpulseJoint,
  type TempContactForceEvent,
} from "@dimforge/rapier3d";
import { InteractionGroups } from "../constants/InteractionGroups";
import { Textures } from "../sources";
import eventsManager, { EventsManager } from "../Utils/EventsManager";
import { CollisionManager } from "../CollisionManager";

export enum GongEvent {
  Hit = "gong:hit",
}

export default class Gong extends Entity {
  private children: PhysicalEntity[] = [];
  private readonly resources: Resources;
  private readonly eventsManager: EventsManager = eventsManager;
  private readonly collisionManager: CollisionManager;
  private baulkColorTexture?: THREE.Texture;
  private baulkNormalTexture?: THREE.Texture;
  private plateColorTexture?: THREE.Texture;
  private plateNormalTexture?: THREE.Texture;
  private plateAmbientOcclusionTexture?: THREE.Texture;
  private plateMetallicTexture?: THREE.Texture;
  private plateRoughnessTexture?: THREE.Texture;
  private logoTexture?: THREE.Texture;
  private physicalWorld: PhysicalWorld;
  private gongPlate?: PhysicalEntity;
  private gongHitSound: HTMLAudioElement = new Audio("sound/gong-sound.mp3");
  private woodHitSound: HTMLAudioElement = new Audio("sound/hit-by-a-wood.mp3");

  constructor() {
    super();

    const experience = new Experience();
    this.resources = experience.resources;
    this.physicalWorld = experience.physicalWorld;
    this.collisionManager = experience.collisionManager;

    this.init();
  }

  update(): void {
    this.children.forEach((child) => child.update());
  }

  private getTextures(): void {
    const [
      baulkColorTexture,
      baulkNormalTexture,
      plateColorTexture,
      plateNormalTexture,
      plateMetallicTexture,
      plateRoughnessTexture,
      plateAmbientOcclusionTexture,
      logoTexture,
    ] = this.resources.getTextures([
      Textures.BaulkColor,
      Textures.BaulkNormal,
      Textures.GongPlateColor,
      Textures.GongPlateNormal,
      Textures.GongPlateMetallic,
      Textures.GongPlateRoughness,
      Textures.GongPlateAO,
      Textures.Logo,
    ]);
    this.baulkColorTexture = baulkColorTexture;
    this.baulkNormalTexture = baulkNormalTexture;
    this.plateColorTexture = plateColorTexture;
    this.plateNormalTexture = plateNormalTexture;
    this.plateMetallicTexture = plateMetallicTexture;
    this.plateRoughnessTexture = plateRoughnessTexture;
    this.plateAmbientOcclusionTexture = plateAmbientOcclusionTexture;
    this.logoTexture = logoTexture;
  }

  private init(): void {
    this.getTextures();
    this.setTextures();
    this.createColumns();
    this.createPlate();
  }

  private setTextures(): void {
    if (this.baulkColorTexture) {
      this.baulkColorTexture.colorSpace = THREE.SRGBColorSpace;
      this.baulkColorTexture.repeat.set(1, 5);
      this.baulkColorTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.baulkNormalTexture) {
      this.baulkNormalTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateColorTexture) {
      this.plateColorTexture.colorSpace = THREE.SRGBColorSpace;
      this.plateColorTexture.repeat.set(3, 3);
      this.plateColorTexture.wrapS = THREE.RepeatWrapping;
      this.plateColorTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateNormalTexture) {
      this.plateNormalTexture.repeat.set(3, 3);
      this.plateNormalTexture.wrapS = THREE.RepeatWrapping;
      this.plateNormalTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateRoughnessTexture) {
      this.plateRoughnessTexture.repeat.set(3, 3);
      this.plateRoughnessTexture.wrapS = THREE.RepeatWrapping;
      this.plateRoughnessTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateMetallicTexture) {
      this.plateMetallicTexture.repeat.set(3, 3);
      this.plateMetallicTexture.wrapS = THREE.RepeatWrapping;
      this.plateMetallicTexture.wrapT = THREE.RepeatWrapping;
    }
    if (this.plateAmbientOcclusionTexture) {
      this.plateAmbientOcclusionTexture.repeat.set(3, 3);
      this.plateAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
      this.plateAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
    }
  }

  private createColumns(): void {
    const columnsPositions = [
      { position: { x: -4, y: 3, z: 0 } },
      { position: { x: 4, y: 3, z: 0 } },
      {
        position: { x: 0, y: 8, z: 0 },
        rotation: { x: 0, y: 0, z: 1, w: Math.PI / 2 },
      },
    ];

    columnsPositions.forEach(({ position, rotation }) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 10, 16),
        new THREE.MeshStandardMaterial({
          map: this.baulkColorTexture,
          normalMap: this.baulkNormalTexture,
        }),
      );
      mesh.castShadow = true;
      const column = new PhysicalEntity({
        shape: { type: "cylinder", radius: 0.2, height: 10 },
        rigidBodyType: "fixed",
        position,
        rotation,
        mesh,
      });

      column.collider.setActiveEvents(ActiveEvents.CONTACT_FORCE_EVENTS);

      this.collisionManager.registerContactForceHandler(
        column.collider.handle,
        this.woodHitHandler,
      );

      this.children.push(column);
    });
  }

  private createPlate(): void {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0, 3, 0.2, 32, 8, true),
      new THREE.MeshStandardMaterial({
        map: this.plateColorTexture,
        normalMap: this.plateNormalTexture,
        roughnessMap: this.plateRoughnessTexture,
        metalnessMap: this.plateMetallicTexture,
        aoMap: this.plateAmbientOcclusionTexture,
        roughness: 0.5,
        metalness: 0.5,
        side: THREE.DoubleSide,
      }),
    );
    mesh.castShadow = true;
    const logo = this.createLogo();
    mesh.add(logo);
    const plate = new PhysicalEntity({
      shape: {
        type: "trimesh",
        vertices: mesh.geometry.attributes.position.array as Float32Array,
        indices:
          (mesh.geometry.index?.array as Uint32Array) || new Uint32Array(),
      },
      density: 1,
      rigidBodyType: "dynamic",
      position: { x: 0, y: 4.7, z: 0 },
      mesh,
      rotation: { x: 1, y: 0, z: 0, w: Math.PI / 2 },
      collisionGroups: InteractionGroups.DYNAMIC_OBJECT,
      damping: 0.2,
    });
    plate.collider.setActiveEvents(ActiveEvents.CONTACT_FORCE_EVENTS);

    this.collisionManager.registerContactForceHandler(
      plate.collider.handle,
      this.gongHitHandler,
    );

    const baulkRigidBody = this.children[2]?.rigidBody; // get baulk by index
    if (plate.rigidBody && baulkRigidBody) {
      let x = { x: 1, y: 0, z: 0 };
      const jointParams = this.physicalWorld.createRevoluteJointData(
        { x: 0, y: 3.3, z: 0 },
        { x: 0, y: 0, z: 0 },
        x,
      );

      this.physicalWorld.instance.createImpulseJoint(
        jointParams,
        plate.rigidBody,
        baulkRigidBody,
        true,
      ) as RevoluteImpulseJoint;

      // joint.setLimits(-Math.PI + 0.1, Math.PI - 0.1);
    }

    this.gongPlate = plate;

    this.children.push(this.gongPlate);
  }

  private createLogo(): THREE.Mesh {
    const logoAspect =
      this.logoTexture?.image.width / this.logoTexture?.image.height;
    const width = 4;
    const height = width / logoAspect;

    const logoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshStandardMaterial({
        map: this.logoTexture,
        alphaTest: 0.01,
        // transparent: true,
      }),
    );
    logoMesh.rotateX(-Math.PI / 2);
    logoMesh.position.set(0, 0.1, 0);
    return logoMesh;
  }

  private playSound(force: number): void {
    const volume = Math.min(force / 1000, 1);
    this.gongHitSound.currentTime = 0;
    this.gongHitSound.volume = volume;
    this.gongHitSound.play();
  }

  private gongHitHandler = (event: TempContactForceEvent): void => {
    const force = event.maxForceMagnitude();
    if (force > 200) {
      this.eventsManager.emit(GongEvent.Hit);
      this.playSound(force);
    }
  };

  private woodHitHandler = (event: TempContactForceEvent): void => {
    const force = event.maxForceMagnitude();
    if (force > 200) {
      this.woodHitSound.currentTime = 0;
      this.woodHitSound.volume = Math.min(force / 1000, 1);
      this.woodHitSound.play();
    }
  };
}

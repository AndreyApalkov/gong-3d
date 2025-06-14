import * as THREE from "three";
import Entity from "../models/Entity";
import PhysicalEntity from "../models/PhysicalEntity";
import Resources from "../Utils/Resources";
import Experience from "../Experience";
import PhysicalWorld from "../PhysicalWorld";
import type { RevoluteImpulseJoint } from "@dimforge/rapier3d";
import { InteractionGroups } from "../constants/InteractionGroups";
import RAPIER from "@dimforge/rapier3d";

export default class Gong extends Entity {
  private children: PhysicalEntity[] = [];
  private resources: Resources;
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
  private hitSound: HTMLAudioElement = new Audio("sound/gong-sound.mp3");

  constructor() {
    super();

    const experience = new Experience();
    this.resources = experience.resources;
    this.physicalWorld = experience.physicalWorld;

    this.loadTextures().then(() => {
      this.init();
    });
  }

  update(): void {
    this.children.forEach((child) => child.update());

    this.physicalWorld.eventQueue.drainContactForceEvents((event) => {
      const force = event.maxForceMagnitude();
      if (force > 200) {
        this.playSound(force);
      }
    });
  }

  private async loadTextures(): Promise<void> {
    const [
      baulkColorTexture,
      baulkNormalTexture,
      plateColorTexture,
      plateNormalTexture,
      plateMetallicTexture,
      plateRoughnessTexture,
      plateAmbientOcclusionTexture,
      logoTexture,
    ] = await this.resources.loadTextures([
      "textures/baulk/color.jpg",
      "textures/baulk/normal.jpg",
      "textures/gong-plate-7/color.jpg",
      "textures/gong-plate-7/normal.jpg",
      "textures/gong-plate-7/metallic.jpg",
      "textures/gong-plate-7/roughness.jpg",
      "textures/gong-plate-7/ambientOcclusion.jpg",
      "textures/logo/casechek-logo.png",
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
      shape: { type: "cylinder", radius: 3, height: 0.2 },
      density: 1,
      rigidBodyType: "dynamic",
      position: { x: 0, y: 4.7, z: 0 },
      mesh,
      rotation: { x: 1, y: 0, z: 0, w: Math.PI / 2 },
      collisionGroups: InteractionGroups.DYNAMIC_OBJECT,
      damping: 0.2,
    });
    plate.collider.setActiveEvents(RAPIER.ActiveEvents.CONTACT_FORCE_EVENTS);

    const baulkRigidBody = this.children[2]?.rigidBody; // get baulk by index
    if (plate.rigidBody && baulkRigidBody) {
      let x = { x: 1, y: 0, z: 0 };
      const jointParams = this.physicalWorld.createRevoluteJointData(
        { x: 0, y: 3.3, z: 0 },
        { x: 0, y: 0, z: 0 },
        x,
      );

      const joint = this.physicalWorld.instance.createImpulseJoint(
        jointParams,
        plate.rigidBody,
        baulkRigidBody,
        true,
      ) as RevoluteImpulseJoint;

      joint.setLimits(-Math.PI + 0.1, Math.PI - 0.1);
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
        transparent: true,
      }),
    );
    logoMesh.rotateX(-Math.PI / 2);
    logoMesh.position.set(0, 0.1, 0);
    return logoMesh;
  }

  private playSound(force: number): void {
    const volume = Math.min(force / 1000, 1);
    this.hitSound.currentTime = 0;
    this.hitSound.volume = volume;
    this.hitSound.play();
  }
}

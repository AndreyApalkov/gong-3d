const { RigidBodyType } = await import("@dimforge/rapier3d");
import * as THREE from "three";
import Experience from "../Experience";
import PhysicalWorld from "../PhysicalWorld";
import { type RigidBody } from "@dimforge/rapier3d";
import Resources from "../Utils/Resources";
import { Object3D, Quaternion, Vector3 } from "three";
import { InteractionGroups } from "../constants/InteractionGroups";
import { Weapon } from "../models/Weapon";
import { Models } from "../sources";

export default class Mallet implements Weapon {
  private resources: Resources;
  private physicalWorld: PhysicalWorld;
  private readonly scene: THREE.Scene;
  private _mesh?: Object3D;
  private rigidBody?: RigidBody;
  private readonly x: number = -0.3;
  private readonly y: number = 0.35;
  private readonly z: number = 0.7;
  private hasOwner: boolean = false;

  constructor() {
    const experience = new Experience();
    this.physicalWorld = experience.physicalWorld;
    this.resources = experience.resources;
    this.scene = experience.scene;
    this.hasOwner = true;

    this.setModel();
    this.setPhysicalObject();
  }

  throw(velocity: Vector3): void {
    this.hasOwner = false;
    this.scene.add(this.mesh!);
    this.rigidBody?.setBodyType(RigidBodyType.Dynamic, true);

    this.rigidBody?.setLinvel(
      { x: velocity.x, y: velocity.y, z: velocity.z },
      true,
    );
    setTimeout(() => {
      const collider = this.rigidBody?.collider(0);
      collider?.setCollisionGroups(InteractionGroups.DYNAMIC_OBJECT);
    }, 200);
  }

  update(): void {
    if (this.hasOwner) {
      const weaponWorldPos = new Vector3();
      const weaponWorldQuat = new Quaternion();

      this._mesh?.getWorldPosition(weaponWorldPos);
      this._mesh?.getWorldQuaternion(weaponWorldQuat);

      this.rigidBody?.setNextKinematicTranslation(weaponWorldPos);
      this.rigidBody?.setNextKinematicRotation(weaponWorldQuat);
    } else {
      const position = this.rigidBody?.translation();
      const rotation = this.rigidBody?.rotation();
      if (position && rotation && this.mesh) {
        this.mesh.position.set(position.x, position.y, position.z);
        this.mesh.setRotationFromQuaternion(
          new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
        );
      }
    }
  }

  get mesh(): Object3D | undefined {
    return this._mesh;
  }

  private setPhysicalObject(): void {
    const { rigidBody, collider } = this.physicalWorld.createObject({
      shape: { type: "cone", radius: 0.3, height: 2.42 },
      density: 3,
      restitution: 0.3,
      rigidBodyType: "kinematicPositionBased",
      ccdEnabled: true,
      collisionGroups: InteractionGroups.PLAYER_WEAPON,
      position: { x: 100, y: 100, z: 100 },
    });

    const euler = new THREE.Euler(0, 0, Math.PI);
    const rotation = new Quaternion().setFromEuler(euler);
    collider.setRotationWrtParent(rotation);
    this.rigidBody = rigidBody;
  }

  private setModel(): void {
    const model = this.resources.getModel(Models.Mallet);
    this._mesh = model?.scene.clone();
    if (!this._mesh) {
      console.error("Mallet: model mesh is undefined");
      return;
    }
    this._mesh.position.set(this.x, this.y, this.z);
    this._mesh.rotation.set(1.1, 1, 0.4);
  }
}

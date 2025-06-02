import Experience from "../Experience";
import PhysicalWorld from "../PhysicalWorld";
import type { RigidBody } from "@dimforge/rapier3d";
import Resources from "../Utils/Resources";
import { GLTF } from "three/examples/jsm/Addons.js";
import { Object3D, Quaternion, Vector3 } from "three";
import { InteractionGroups } from "../constants/InteractionGroups";
import { Weapon } from "../models/Weapon";
import { Watchable } from "../Utils/LoadWatcher";

export default class Hammer extends Watchable implements Weapon {
  private resources: Resources;
  private physicalWorld: PhysicalWorld;
  private model?: GLTF;
  private rigidBody?: RigidBody;
  private readonly x: number = -0.5;
  private readonly y: number = 0.6;
  private readonly z: number = 1.7;

  constructor() {
    super();
    const experience = new Experience();
    this.physicalWorld = experience.physicalWorld;
    this.resources = experience.resources;

    this.loadModel().then(() => {
      this.setPhysicalObject();
    });
  }

  update(): void {
    const weaponWorldPos = new Vector3();
    const weaponWorldQuat = new Quaternion();

    this.model?.scene.getWorldPosition(weaponWorldPos);
    this.model?.scene.getWorldQuaternion(weaponWorldQuat);

    this.rigidBody?.setNextKinematicTranslation(weaponWorldPos);
    this.rigidBody?.setNextKinematicRotation(weaponWorldQuat);
  }

  get mesh(): Object3D | undefined {
    return this.model?.scene;
  }

  private setPhysicalObject(): void {
    const { rigidBody } = this.physicalWorld.createObject({
      shape: { type: "cylinder", radius: 0.2, height: 3 },
      density: 0.01,
      rigidBodyType: "kinematicPositionBased",
      collisionGroups: InteractionGroups.PLAYER_WEAPON,
    });

    this.rigidBody = rigidBody;
  }

  private async loadModel(): Promise<void> {
    this.model = await this.resources.loadModel("models/hammer.glb");
    this.model?.scene.scale.setScalar(0.3);
    this.model?.scene.position.set(this.x, this.y, this.z);
    this.model?.scene.rotation.set(1.1, 1, 0.4);
    this.dispatchEvent({ type: "loaded" });
  }
}

import {
  AnimationAction,
  AnimationMixer,
  Box3,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  NormalBlending,
  Object3D,
  Object3DEventMap,
  Vector3,
} from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import Time from "../Utils/Time";
import PhysicalEntity from "../models/PhysicalEntity";
import { Models } from "../sources";

export class Palm {
  private readonly resources: Resources;
  private readonly time: Time;
  private model?: GLTF;
  private body?: PhysicalEntity;
  private animationMixer?: AnimationMixer;
  private animations: AnimationAction[] = [];

  constructor(
    private position: Vector3 = new Vector3(0, 0, 0),
    private scale: number = 1.5,
    private trunkRadius: number = 0.35,
  ) {
    const experience = new Experience();
    this.resources = experience.resources;
    this.time = experience.time;

    this.setup();
  }

  update(): void {
    this.body?.update();
    this.animationMixer?.update(this.time.delta);
  }

  setVisible(value: boolean): void {
    if (this.body) {
      this.body.mesh.visible = value;
      this.body.rigidBody.setEnabled(value);
    }

    if (value) {
      this.animations.forEach((action) => action.play());
    } else {
      this.animations.forEach((action) => action.stop());
    }
  }

  private setup(): void {
    this.model = this.resources.getModel(Models.Palm);
    if (!this.model) return;

    const visual = this.model.scene;
    visual.scale.setScalar(this.scale);

    visual.traverse((child) => {
      if (!(child instanceof Mesh)) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const materials: MeshStandardMaterial[] = Array.isArray(child.material)
        ? child.material
        : [child.material];

      materials.forEach((material) => {
        if (material?.map && material.transparent) {
          material.transparent = false;
          material.depthWrite = true;
          material.alphaTest = 0.5;
          material.side = DoubleSide;
          material.blending = NormalBlending;
        }
      });
    });

    const bbox = new Box3().setFromObject(visual);
    const size = new Vector3();
    bbox.getSize(size);

    const group = new Group();
    visual.position.set(0, -size.y / 2, 0);
    group.add(visual);

    this.body = new PhysicalEntity({
      shape: { type: "cylinder", radius: this.trunkRadius, height: size.y },
      rigidBodyType: "fixed",
      position: {
        x: this.position.x,
        y: this.position.y + size.y / 2,
        z: this.position.z,
      },
      friction: 1,
      mesh: group,
    });

    this.animationMixer = new AnimationMixer(
      visual as unknown as Object3D<Object3DEventMap>,
    );

    this.animations = this.model.animations.map((clip) =>
      this.animationMixer!.clipAction(clip),
    );
  }
}

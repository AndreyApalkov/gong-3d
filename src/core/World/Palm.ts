import {
  AnimationAction,
  AnimationMixer,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  NormalBlending,
  Object3D,
  Object3DEventMap,
  Scene,
  Vector3,
} from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import Time from "../Utils/Time";
import { Models } from "../sources";

export class Palm {
  private readonly scene: Scene;
  private readonly resources: Resources;
  private readonly time: Time;
  private model?: GLTF;
  private root?: Object3D;
  private animationMixer?: AnimationMixer;
  private animations: AnimationAction[] = [];

  constructor(
    private position: Vector3 = new Vector3(0, 0, 0),
    private scale: number = 1,
  ) {
    const experience = new Experience();
    this.scene = experience.scene;
    this.resources = experience.resources;
    this.time = experience.time;

    this.setup();
  }

  update(): void {
    this.animationMixer?.update(this.time.delta);
  }

  setVisible(value: boolean): void {
    if (this.root) {
      this.root.visible = value;
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

    this.root = this.model.scene;
    this.root.scale.setScalar(this.scale);
    this.root.position.copy(this.position);

    this.root.traverse((child) => {
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

    this.animationMixer = new AnimationMixer(
      this.root as unknown as Object3D<Object3DEventMap>,
    );

    this.animations = this.model.animations.map((clip) =>
      this.animationMixer!.clipAction(clip),
    );

    this.scene.add(this.root);
  }
}

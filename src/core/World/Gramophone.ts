import {
  AnimationAction,
  AnimationMixer,
  Box3,
  Group,
  Object3D,
  Object3DEventMap,
  Vector3,
} from "three";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import { GLTF } from "three/examples/jsm/Addons.js";
import { Models } from "../sources";
import PhysicalEntity from "../models/PhysicalEntity";
import Time from "../Utils/Time";

export class Gramophone {
  private readonly resources: Resources;
  private readonly time: Time;
  private model?: GLTF;
  private gramophone?: PhysicalEntity;
  private animationMixer?: AnimationMixer;
  private animation?: AnimationAction;

  constructor(private position: Vector3 = new Vector3(0, 0, 0)) {
    const experience = new Experience();

    this.resources = experience.resources;
    this.time = experience.time;
    this.setup();
  }

  private setup(): void {
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
    }
  }

  update(): void {
    this.gramophone?.update();

    this.animationMixer?.update(this.time.delta);
  }
}

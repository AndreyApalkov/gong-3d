import * as THREE from "three";
import { type RigidBody } from "@dimforge/rapier3d";
import { GLTF } from "three/examples/jsm/Addons.js";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import PhysicalWorld from "../PhysicalWorld";
import { Models } from "../sources";

export class ChristmasTree extends THREE.Group {
  private readonly resources: Resources;
  private physicalWorld: PhysicalWorld;
  private model?: GLTF;
  private rigidBody?: RigidBody;

  constructor(position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    super();
    const experience = new Experience();

    this.resources = experience.resources;
    this.physicalWorld = experience.physicalWorld;

    this.position.copy(position);
    this.setup();
  }

  private setup(): void {
    this.model = this.resources.getModel(Models.ChristmasTree);
    if (this.model) {
      this.model.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          //   child.receiveShadow = true;
          const material = child.material;

          if (material.map && material.transparent) {
            material.transparent = false;
            material.depthWrite = true;
            material.alphaTest = 0.5;
            material.side = THREE.DoubleSide;
            material.blending = THREE.NormalBlending;
          }
        }
      });
      this.model.scene.scale.setScalar(4);
      this.model.scene.rotateY(Math.PI / 2);
      this.add(this.model.scene);
      this.position.copy(this.position);

      const boundingBox = new THREE.Box3().setFromObject(this.model.scene);
      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      const { rigidBody } = this.physicalWorld.createObject({
        shape: { type: "cylinder", radius: 1, height: size.y },
        rigidBodyType: "fixed",
        position: {
          x: this.position.x,
          y: this.position.y + size.y / 2,
          z: this.position.z,
        },
        ccdEnabled: true,
      });

      this.rigidBody = rigidBody;
    }
  }

  setVisible(value: boolean) {
    this.visible = value;

    if (this.rigidBody) {
      this.rigidBody.setEnabled(value);
    }
  }
}

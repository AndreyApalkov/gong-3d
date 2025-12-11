import * as THREE from "three";
import { GLTF } from "three/examples/jsm/Addons.js";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import { Models } from "../sources";
import PhysicalEntity from "../models/PhysicalEntity";

export class ChristmasTree {
  private readonly resources: Resources;
  private model?: GLTF;
  private gifts: PhysicalEntity[] = [];
  private tree?: PhysicalEntity;

  constructor(private position: THREE.Vector3 = new THREE.Vector3(0, 0, 0)) {
    const experience = new Experience();

    this.resources = experience.resources;
    this.setup();
  }

  private setup(): void {
    this.model = this.resources.getModel(Models.ChristmasTree);
    if (this.model) {
      this.model.scene.scale.setScalar(4);
      this.model.scene.updateMatrixWorld(true);

      this.model.scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

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

        if (child.name.startsWith("gift")) {
          this.addGift(child);
        }
      });

      this.model.scene.rotateY(Math.PI / 2);
      const group = new THREE.Group();
      group.add(this.model.scene);

      const boundingBox = new THREE.Box3().setFromObject(this.model.scene);
      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      this.model.scene.position.set(0, -size.y / 2, 0);

      this.tree = new PhysicalEntity({
        shape: { type: "box", sizes: { x: 0.2, y: size.y, z: 0.2 } },
        rigidBodyType: "dynamic",
        position: {
          x: this.position.x,
          y: this.position.y + size.y / 2,
          z: this.position.z,
        },
        friction: 1,
        damping: 2,
        density: 100,
        mesh: group,
      });
    }
  }

  private addGift(mesh: THREE.Mesh): void {
    const worldQuat = new THREE.Quaternion();
    mesh.getWorldQuaternion(worldQuat);

    const worldPos = new THREE.Vector3();
    mesh.getWorldPosition(worldPos);
    worldPos.multiplyScalar(2);

    const scale = new THREE.Vector3(6, 6, 6);
    mesh.geometry.computeBoundingBox();
    const boundingBox = mesh.geometry.boundingBox!;
    const size = new THREE.Vector3();
    boundingBox.getSize(size).multiply(scale);

    mesh.scale.copy(scale);

    const gift = new PhysicalEntity({
      mesh: mesh,
      shape: {
        type: "box",
        sizes: {
          x: size.x,
          y: size.y,
          z: size.z,
        },
      },
      rigidBodyType: "dynamic",
      position: {
        x: worldPos.x + this.position.x,
        y: worldPos.y + this.position.y,
        z: worldPos.z + this.position.z,
      },
      rotation: {
        x: worldQuat.x,
        y: worldQuat.y,
        z: worldQuat.z,
        w: worldQuat.w,
      },
      friction: 0.7,
      density: 1,
    });
    this.gifts.push(gift);
  }

  setVisible(value: boolean) {
    if (this.tree) {
      this.tree.mesh.visible = value;
      this.tree.rigidBody.setEnabled(value);
    }

    this.gifts.forEach((gift) => {
      gift.mesh.visible = value;
      gift.rigidBody.setEnabled(value);
    });
  }

  update(): void {
    this.gifts.forEach((gift) => gift.update());
    this.tree?.update();
  }
}

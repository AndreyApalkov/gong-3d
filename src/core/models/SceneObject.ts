import * as THREE from "three";
import Experience from "../Experience";

export type SceneObjectParams = {
  mesh: THREE.Object3D;
};

export default class SceneObject {
  private readonly scene: THREE.Scene;
  private _mesh: THREE.Object3D;

  constructor(params: SceneObjectParams) {
    const { mesh } = params;
    this._mesh = mesh;

    this.scene = new Experience().scene;

    this.setMesh();
  }

  get mesh(): THREE.Object3D {
    return this._mesh;
  }

  private setMesh() {
    this.scene.add(this._mesh);
  }
}

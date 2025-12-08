import * as THREE from "three";
import Experience from "../Experience.js";
import Resources from "../Utils/Resources.js";

export default class Floor {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;
  private readonly size = 200;

  private geometry?: THREE.BufferGeometry;
  private colorTexture?: THREE.Texture;
  private normalTexture?: THREE.Texture;
  private displacementTexture?: THREE.Texture;
  private roughnessTexture?: THREE.Texture;
  private aOTexture?: THREE.Texture;
  private material?: THREE.Material;
  private mesh?: THREE.Mesh;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setPhysicalBody();

    this.loadTextures().then(() => {
      this.init();
    });
  }

  private setPhysicalBody(): void {
    const { rigidBody } = this.experience.physicalWorld.createObject({
      shape: { type: "box", sizes: { x: this.size, y: 0.5, z: this.size } },
      position: { x: 0, y: -0.5, z: 0 },
      rigidBodyType: "fixed",
    });
    rigidBody.setTranslation({ x: 0, y: -0.25, z: 0 }, true);
    // collider.setFriction(1);
  }

  private init(): void {
    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  private async loadTextures(): Promise<void> {
    const [
      colorTexture,
      normalTexture,
      displacementTexture,
      roughnessTexture,
      aOTexture,
    ] = await this.resources.loadTextures([
      "textures/floor/snow/color.jpg",
      "textures/floor/snow/normal.jpg",
      "textures/floor/snow/displacement.png",
      "textures/floor/snow/roughness.jpg",
      "textures/floor/snow/ao.jpg",
    ]);
    this.colorTexture = colorTexture;
    this.normalTexture = normalTexture;
    this.displacementTexture = displacementTexture;
    this.roughnessTexture = roughnessTexture;
    this.aOTexture = aOTexture;
  }

  private setGeometry(): void {
    this.geometry = new THREE.PlaneGeometry(this.size, this.size, 512, 512);
  }

  private setTextures(): void {
    if (this.colorTexture) {
      // this.colorTexture.colorSpace = THREE.SRGBColorSpace;
      this.colorTexture.repeat.set(10, 10);
      this.colorTexture.wrapS = THREE.RepeatWrapping;
      this.colorTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.normalTexture) {
      this.normalTexture.repeat.set(10, 10);
      this.normalTexture.wrapS = THREE.RepeatWrapping;
      this.normalTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.displacementTexture) {
      this.displacementTexture.repeat.set(10, 10);
      this.displacementTexture.wrapS = THREE.RepeatWrapping;
      this.displacementTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.roughnessTexture) {
      this.roughnessTexture.repeat.set(10, 10);
      this.roughnessTexture.wrapS = THREE.RepeatWrapping;
      this.roughnessTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.aOTexture) {
      this.aOTexture.repeat.set(10, 10);
      this.aOTexture.wrapS = THREE.RepeatWrapping;
      this.aOTexture.wrapT = THREE.RepeatWrapping;
    }
  }

  private setMaterial(): void {
    this.material = new THREE.MeshStandardMaterial({
      map: this.colorTexture,
      normalMap: this.normalTexture,
      displacementMap: this.displacementTexture,
      side: THREE.DoubleSide,
      displacementBias: -0.5,
      roughnessMap: this.roughnessTexture,
      aoMap: this.aOTexture,
    });
  }

  private setMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.x = -Math.PI * 0.5;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }
}

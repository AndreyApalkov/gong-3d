import * as THREE from "three";
import Experience from "../Experience.js";
import Resources from "../Utils/Resources.js";

export default class Floor {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;
  private readonly size = 200;
  private readonly textureRepeat = 10;

  private geometry?: THREE.BufferGeometry;
  private colorTexture?: THREE.Texture;
  private normalTexture?: THREE.Texture;
  private displacementTexture?: THREE.Texture;
  private roughnessTexture?: THREE.Texture;
  private aOTexture?: THREE.Texture;
  private material!: THREE.MeshStandardMaterial;
  private mesh?: THREE.Mesh;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    this.setPhysicalBody();

    this.init();
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
    this.setMaterial();
    this.setMesh();
  }

  private setGeometry(): void {
    this.geometry = new THREE.PlaneGeometry(this.size, this.size, 512, 512);
  }

  setTextures(texturePaths: string[]): void {
    this.colorTexture = this.resources.getTexture(texturePaths[0]);
    this.normalTexture = this.resources.getTexture(texturePaths[1]);
    this.displacementTexture = this.resources.getTexture(texturePaths[2]);
    this.roughnessTexture = this.resources.getTexture(texturePaths[3]);
    this.aOTexture = this.resources.getTexture(texturePaths[4]);

    if (this.colorTexture) {
      // this.colorTexture.colorSpace = THREE.SRGBColorSpace;
      this.colorTexture.repeat.set(this.textureRepeat, this.textureRepeat);
      this.colorTexture.wrapS = THREE.RepeatWrapping;
      this.colorTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.normalTexture) {
      this.normalTexture.repeat.set(this.textureRepeat, this.textureRepeat);
      this.normalTexture.wrapS = THREE.RepeatWrapping;
      this.normalTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.displacementTexture) {
      this.displacementTexture.repeat.set(
        this.textureRepeat,
        this.textureRepeat,
      );
      this.displacementTexture.wrapS = THREE.RepeatWrapping;
      this.displacementTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.roughnessTexture) {
      this.roughnessTexture.repeat.set(this.textureRepeat, this.textureRepeat);
      this.roughnessTexture.wrapS = THREE.RepeatWrapping;
      this.roughnessTexture.wrapT = THREE.RepeatWrapping;
    }

    if (this.aOTexture) {
      this.aOTexture.repeat.set(this.textureRepeat, this.textureRepeat);
      this.aOTexture.wrapS = THREE.RepeatWrapping;
      this.aOTexture.wrapT = THREE.RepeatWrapping;
    }

    this.material.map = this.colorTexture ?? null;
    this.material.normalMap = this.normalTexture ?? null;
    this.material.displacementMap = this.displacementTexture ?? null;
    this.material.roughnessMap = this.roughnessTexture ?? null;
    this.material.aoMap = this.aOTexture ?? null;
    this.material.needsUpdate = true;
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

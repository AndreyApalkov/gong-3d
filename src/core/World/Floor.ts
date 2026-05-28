import * as THREE from "three";
import Experience from "../Experience.js";
import Resources from "../Utils/Resources.js";

export default class Floor {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;
  private readonly size = 200;
  private readonly subdivisions = 512;
  private readonly textureRepeat = 10;

  private readonly islandLandRadius = 55;
  private readonly islandShoreRadius = 78;
  private readonly seabedY = -6;
  private readonly displacementScale = 0.08;
  private readonly displacementBias = -0.04;

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

    this.init();
    this.setPhysicalBody();
  }

  private init(): void {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  private setGeometry(): void {
    const geom = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.subdivisions,
      this.subdivisions,
    );

    const pos = geom.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, this.computeHeight(x, y));
    }

    geom.rotateX(-Math.PI / 2);
    geom.computeVertexNormals();

    this.geometry = geom;
  }

  private setPhysicalBody(): void {
    if (!this.geometry || !this.geometry.index) return;

    const vertices = new Float32Array(
      (this.geometry.attributes.position as THREE.BufferAttribute).array,
    );
    const indices = new Uint32Array(this.geometry.index.array);

    this.experience.physicalWorld.createObject({
      shape: { type: "trimesh", vertices, indices },
      position: { x: 0, y: 0, z: 0 },
      rigidBodyType: "fixed",
      friction: 1,
    });
  }

  setTextures(texturePaths: string[]): void {
    this.colorTexture = this.resources.getTexture(texturePaths[0]);
    this.normalTexture = this.resources.getTexture(texturePaths[1]);
    this.displacementTexture = this.resources.getTexture(texturePaths[2]);
    this.roughnessTexture = this.resources.getTexture(texturePaths[3]);
    this.aOTexture = this.resources.getTexture(texturePaths[4]);

    if (this.colorTexture) {
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
      displacementScale: this.displacementScale,
      displacementBias: this.displacementBias,
      side: THREE.DoubleSide,
      roughnessMap: this.roughnessTexture,
      aoMap: this.aOTexture,
    });
  }

  private setMesh(): void {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  private computeHeight(x: number, y: number): number {
    const r = Math.sqrt(x * x + y * y);

    if (r <= this.islandLandRadius) return 0;
    if (r >= this.islandShoreRadius) return this.seabedY;

    const t =
      (r - this.islandLandRadius) /
      (this.islandShoreRadius - this.islandLandRadius);

    return THREE.MathUtils.lerp(
      0,
      this.seabedY,
      THREE.MathUtils.smoothstep(t, 0, 1),
    );
  }
}

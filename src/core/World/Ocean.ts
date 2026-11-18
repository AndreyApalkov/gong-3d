import * as THREE from "three";
import { Collider } from "@dimforge/rapier3d";
import { Water as WaterMesh } from "three/addons/objects/Water.js";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import Time from "../Utils/Time";
import { Textures } from "../sources";

export default class Ocean {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly resources: Resources;
  private readonly time: Time;
  private readonly size = 2000;
  private readonly level = -1.5;
  private readonly opacity = 0.85;
  private readonly flowIntensity = 0.5;
  private readonly iceThickness = 1;
  private readonly iceFriction = 0.05;
  private readonly iceTextureRepeat = 200;

  private water!: WaterMesh;
  private ice!: THREE.Mesh;
  private iceCollider!: Collider;
  private frozen = false;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.setMesh();
    this.setIce();
    this.setFrozen(false);
  }

  get isFrozen(): boolean {
    return this.frozen;
  }

  isIce(collider?: Collider | null): boolean {
    return this.frozen && collider?.handle === this.iceCollider.handle;
  }

  setFrozen(frozen: boolean): void {
    this.frozen = frozen;
    this.water.visible = !frozen;
    this.ice.visible = frozen;
    this.iceCollider.setEnabled(frozen);
  }

  private setMesh(): void {
    const normals = this.resources.getTexture(Textures.WaterNormals);
    if (normals) {
      normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
    }

    const sunDirection =
      this.experience.world?.environment?.sunDirection ??
      new THREE.Vector3(0, 1, 0);

    const geometry = new THREE.PlaneGeometry(this.size, this.size);
    this.water = new WaterMesh(geometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: normals,
      sunDirection,
      sunColor: 0xffffff,
      waterColor: "#076cbe",
      distortionScale: 3.7,
      side: THREE.DoubleSide,
      alpha: this.opacity,
      fog: false,
    });
    this.water.material.uniforms.size = new THREE.Uniform(5);
    this.water.material.transparent = true;
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = this.level;
    this.scene.add(this.water);
  }

  private setIce(): void {
    const normals = this.resources.getTexture(Textures.WaterNormals)?.clone();
    if (normals) {
      normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
      normals.repeat.set(this.iceTextureRepeat, this.iceTextureRepeat);
    }

    this.ice = new THREE.Mesh(
      new THREE.PlaneGeometry(this.size, this.size),
      new THREE.MeshStandardMaterial({
        color: "#cfe6f2",
        opacity: 0.95,
        transparent: true,
        roughness: 0.15,
        metalness: 0.1,
        normalMap: normals ?? null,
        normalScale: new THREE.Vector2(0.15, 0.15),
      }),
    );
    this.ice.rotation.x = -Math.PI / 2;
    this.ice.position.y = this.level;
    this.ice.receiveShadow = true;
    this.scene.add(this.ice);

    // Thin slab whose top surface sits at water level; the island floor rises
    // above it, so it only becomes walkable once the shore dips under water.
    const { collider } = this.experience.physicalWorld.createObject({
      shape: {
        type: "box",
        sizes: { x: this.size, y: this.iceThickness, z: this.size },
      },
      position: { x: 0, y: this.level - this.iceThickness / 2, z: 0 },
      rigidBodyType: "fixed",
      friction: this.iceFriction,
    });
    this.iceCollider = collider;
  }

  update(): void {
    if (this.frozen) return;

    const uniforms = this.water.material.uniforms;
    uniforms.time.value += this.time.delta * this.flowIntensity;
    const sun = this.experience.world?.environment?.sunDirection;
    if (sun) uniforms.sunDirection.value.copy(sun);
  }
}

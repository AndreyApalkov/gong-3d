import * as THREE from "three";
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

  private water!: WaterMesh;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.setMesh();
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

  update(): void {
    const uniforms = this.water.material.uniforms;
    uniforms.time.value += this.time.delta * this.flowIntensity;
    const sun = this.experience.world?.environment?.sunDirection;
    if (sun) uniforms.sunDirection.value.copy(sun);
  }
}

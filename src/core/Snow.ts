import * as THREE from "three";
import Experience from "./Experience";
import vertexShader from "./shaders/snow/vertex.glsl";
import fragmentShader from "./shaders/snow/fragment.glsl";
import Debug from "./Utils/Debug";

type Uniforms = {
  uTime: THREE.Uniform<number>;
  uTexture: THREE.Uniform<THREE.Texture | null>;
  uResolution: THREE.Uniform<THREE.Vector2>;
};

export class Snow extends THREE.Group {
  private snowflakesCount: number = 500000;
  private snowflakeSize: number = 0.1;
  private uniforms: Uniforms;
  private points?: THREE.Points;

  private readonly debug: Debug;

  constructor() {
    super();

    const experience = new Experience();
    const resources = experience.resources;
    this.debug = experience.debug;
    const size = experience.sizes;
    const { width, height } = size.resolution;

    this.uniforms = {
      uTime: new THREE.Uniform(0),
      uTexture: new THREE.Uniform(null),
      uResolution: new THREE.Uniform(new THREE.Vector2(width, height)),
    };

    resources.loadTexture("textures/sprites/snowflake.png").then((texture) => {
      if (texture) {
        this.uniforms.uTexture.value = texture;
      }
      this.setPoints();
    });

    if (this.debug.active) {
      this.setDebug();
    }
  }

  update() {
    this.uniforms.uTime.value = performance.now() * 0.001;
  }

  private setPoints(): void {
    const COUNT = this.snowflakesCount;

    const geometry = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const speeds = new Float32Array(COUNT);
    const offsets = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = Math.random() * 200 - 100;
      pos[i3 + 1] = 50;
      pos[i3 + 2] = Math.random() * 200 - 100;

      sizes[i] = this.snowflakeSize + Math.random() * this.snowflakeSize;
      speeds[i] = 0.5 + Math.random() * 1.5;
      offsets[i] = Math.random() * 1000;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });

    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.add(this.points);
  }

  private setDebug(): void {
    const folder = this.debug.ui?.addFolder("snow");

    folder
      ?.add(this, "snowflakesCount")
      .min(1000)
      .max(5000000)
      .step(1000)
      .onFinishChange(() => {
        this.points?.geometry.dispose();
        this.remove(this.points!);
        this.setPoints();
      });

    folder
      ?.add(this, "snowflakeSize")
      .min(0.01)
      .max(1)
      .step(0.01)
      .onFinishChange(() => {
        this.points?.geometry.dispose();
        this.remove(this.points!);
        this.setPoints();
      });
  }
}

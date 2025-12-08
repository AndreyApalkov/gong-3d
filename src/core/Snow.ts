import * as THREE from "three";
import Experience from "./Experience";
import vertexShader from "./shaders/snow/vertex.glsl";
import fragmentShader from "./shaders/snow/fragment.glsl";

type Uniforms = {
  uTime: THREE.Uniform<number>;
  uTexture: THREE.Uniform<THREE.Texture | null>;
  uResolution: THREE.Uniform<THREE.Vector2>;
};

export class Snow extends THREE.Group {
  private uniforms: Uniforms;
  private points?: THREE.Points;

  constructor() {
    super();

    const experience = new Experience();
    const resources = experience.resources;
    const size = experience.sizes;
    const { width, height } = size.resolution;

    this.uniforms = {
      uTime: new THREE.Uniform(0),
      uTexture: new THREE.Uniform(null),
      uResolution: new THREE.Uniform(new THREE.Vector2(width, height)),
    };

    resources.loadTexture("textures/sprites/snowflake.png").then((texture) => {
      if (texture) {
        this.init(texture);
      }
    });
  }

  init(texture: THREE.Texture) {
    const COUNT = 500000;

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

      sizes[i] = 0.1 + Math.random() * 0.1;
      speeds[i] = 0.5 + Math.random() * 1.5;
      offsets[i] = Math.random() * 1000;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

    this.uniforms.uTexture.value = texture;

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

  update() {
    this.uniforms.uTime.value = performance.now() * 0.001;
  }
}

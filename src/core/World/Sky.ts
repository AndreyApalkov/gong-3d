import * as THREE from "three";

import vertexShader from "../shaders/sky/vertex.glsl";
import fragmentShader from "../shaders/sky/fragment.glsl";
import Resources from "../Utils/Resources";
import Experience from "../Experience";

export default class Sky extends THREE.Mesh<
  THREE.SphereGeometry,
  THREE.ShaderMaterial
> {
  private readonly resources: Resources;
  private readonly nightTexturePath =
    "textures/environment/stars_milky_way_8k.jpg";
  private nightTexture?: THREE.Texture;
  public isSky: boolean;

  constructor() {
    const material = new THREE.ShaderMaterial({
      name: "SkyShader",
      uniforms: {
        turbidity: { value: 3 },
        rayleigh: { value: 3 },
        mieCoefficient: { value: 0.1 },
        mieDirectionalG: { value: 0.9999 },
        sunPosition: { value: new THREE.Vector3() },
        up: { value: new THREE.Vector3(0, 1, 0) },
        uDayNightMixFactor: { value: 1 },
        uNightTexture: new THREE.Uniform(null),
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide,
      depthWrite: false,
    });
    super(new THREE.SphereGeometry(1, 10, 10), material);
    const experience = new Experience();
    this.resources = experience.resources;
    this.isSky = true;

    this.loadTexture();
    this.scale.setScalar(450000);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.nightTexture?.dispose();
  }

  private async loadTexture() {
    this.nightTexture = await this.resources.loadTexture(this.nightTexturePath);

    if (this.nightTexture) {
      this.nightTexture.colorSpace = THREE.SRGBColorSpace;
      this.nightTexture.mapping = THREE.EquirectangularReflectionMapping;
      this.material.uniforms.uNightTexture.value = this.nightTexture;
    }
  }
}

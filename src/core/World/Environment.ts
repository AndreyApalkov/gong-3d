import * as THREE from "three";
import GUI from "lil-gui";
import Experience from "../Experience";
import Debug from "../Utils/Debug";
import Time from "../Utils/Time";
import Sky from "./Sky";
import { Snow } from "../Snow";
import Resources from "../Utils/Resources";
import { Textures } from "../sources";

export type TimeOfDay = "morning" | "day" | "evening" | "night";

export default class Environment {
  private readonly times = {
    morning: THREE.MathUtils.degToRad(80),
    day: THREE.MathUtils.degToRad(-20),
    evening: THREE.MathUtils.degToRad(275),
    night: THREE.MathUtils.degToRad(180),
  };
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly time: Time;
  private readonly debug: Debug;
  private readonly resources: Resources;
  private debugFolder?: GUI;
  private sunLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;
  private spotLight!: THREE.SpotLight;
  private sky!: Sky;
  private snow: Snow;
  private phi = THREE.MathUtils.degToRad(80);
  private theta = THREE.MathUtils.degToRad(50);
  private timeScale = 1;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.resources = this.experience.resources;
    this.snow = new Snow();
    this.snow.visible = false;
    this.scene.add(this.snow);

    this.setLight();
    this.setSky();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  private setLight(): void {
    // directional light
    this.sunLight = new THREE.DirectionalLight("#ffffff", 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.left = -20;
    this.sunLight.shadow.camera.right = 20;
    this.sunLight.shadow.camera.top = 20;
    this.sunLight.shadow.camera.bottom = -20;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 200;
    this.sunLight.shadow.mapSize.set(256, 256);
    this.sunLight.shadow.normalBias = 0.08;
    // this.sunLight.position.set(3.5, 2, -1.25).multiplyScalar(100);
    // this.sunLight.shadow.camera.position.set(3.5, 2, -1.25).multiplyScalar(100);
    this.scene.add(this.sunLight);
    // ambient light
    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    this.scene.add(this.ambientLight);

    // spot light
    this.spotLight = new THREE.SpotLight(
      "#edb554",
      60,
      300,
      Math.PI / 3,
      0.5,
      1,
    );
    this.spotLight.position.set(0, 19, 6);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.mapSize.width = 512;
    this.spotLight.shadow.mapSize.height = 512;
    this.spotLight.shadow.camera.near = 0.5;
    this.spotLight.shadow.camera.far = 20;

    this.scene.add(this.spotLight);
  }

  private setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("environment");

    // this.debugFolder
    //   ?.add(this.sunLight, "intensity")
    //   .min(0)
    //   .max(10)
    //   .step(0.001)
    //   .name("sunLightIntensity");
    this.debugFolder
      ?.add(this, "phi")
      .min(0)
      .max(Math.PI * 2)
      .step(0.001)
      .name("sun phi");
    this.debugFolder
      ?.add(this, "theta")
      .min(0)
      .max(Math.PI * 2)
      .step(0.001)
      .name("sun theta");
    this.debugFolder
      ?.add(this, "timeScale")
      .min(0)
      .max(10000)
      .step(1)
      .name("time scale");
  }

  private setSky(): void {
    this.sky = new Sky();
    this.scene.add(this.sky);

    const environmentTexture = this.resources.getTexture(
      Textures.EnvironmentNight,
    );
    if (environmentTexture) {
      environmentTexture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = environmentTexture;
    }
  }

  update() {
    this.phi -= (this.time.delta * Math.PI * 2 * this.timeScale) / 86400;
    const sunCosine = Math.cos(this.phi);
    const isNight = sunCosine < 0;
    const sunPosition = new THREE.Vector3().setFromSphericalCoords(
      1,
      this.phi,
      this.theta,
    );
    this.sunLight.position.copy(sunPosition.clone().multiplyScalar(50));
    const sunLightIntensity = THREE.MathUtils.smoothstep(sunCosine, -0.2, 0.1);
    const ambientIntensity = Math.max(0.5 * sunLightIntensity, 0.1);

    this.sunLight.intensity = 4 * sunLightIntensity;
    this.ambientLight.intensity = ambientIntensity;
    this.scene.environmentIntensity = ambientIntensity;
    this.spotLight.intensity = isNight ? 60 : 0;
    this.snow.update();

    // Update sky
    const uDayNightMixFactor = THREE.MathUtils.smoothstep(sunCosine, -0.5, 0.3);
    const uniforms = this.sky.material.uniforms;
    uniforms.sunPosition.value = sunPosition;
    uniforms.uDayNightMixFactor.value = uDayNightMixFactor;
  }

  toggleSnow(visible: boolean): void {
    this.snow.visible = visible;
  }

  setTimeOfDay(time: TimeOfDay): void {
    this.phi = this.times[time];
  }
}

import { GLTF } from "three/examples/jsm/Addons.js";
import Experience from "../Experience";
import Resources from "../Utils/Resources";
import PhysicalEntity from "../models/PhysicalEntity";
import { AnimationAction, AnimationMixer } from "three";
import Time from "../Utils/Time";
import {
  ArmsAnimationKey,
  PlayerAnimations,
} from "../constants/ArmsAnimations";
import { Weapon } from "../models/Weapon";
import { Watchable } from "../Utils/LoadWatcher";

export default class Arms extends Watchable {
  private readonly resources: Resources;
  private readonly time: Time;
  private parent: PhysicalEntity;
  private model?: GLTF;
  private animationMixer?: AnimationMixer;
  private animationActions: Map<ArmsAnimationKey, AnimationAction> = new Map();
  private currentActionName?: ArmsAnimationKey;
  private currentAction?: AnimationAction;
  private animationRepetitions: number = Infinity;
  private animationTimeScale: number = 1;

  constructor(parent: PhysicalEntity) {
    super();
    this.parent = parent;
    const experience = new Experience();

    this.resources = experience.resources;
    this.time = experience.time;

    this.loadModel();

    this.handleAnimationComplete = this.handleAnimationComplete.bind(this);
  }

  hit(): void {
    const randomAttackAnimation =
      PlayerAnimations.ATTACKS[
        Math.floor(Math.random() * PlayerAnimations.ATTACKS.length)
      ].actionName;
    this.setCurrentActionName(randomAttackAnimation);
  }

  setWeapon(weapon: Weapon): void {
    const rightHandBone = this.model?.scene.getObjectByName("Right_Ombro019");
    if (!rightHandBone) {
      console.error("Right hand bone not found in the model.");
      return;
    }
    if (!weapon.mesh) {
      console.error("Weapon mesh is not defined.");
      return;
    }

    this.setCurrentActionName("Draw_sword");
    rightHandBone.add(weapon.mesh);
  }

  update(): void {
    if (this.currentActionName !== this.currentAction?.getClip().name) {
      this.changeAnimation();
    }

    this.animationMixer?.update(this.time.delta / 1000);
  }

  private async loadModel(): Promise<void> {
    this.model = await this.resources.loadModel("models/arms.glb");

    if (this.model?.scene) {
      const modelMesh = this.model.scene;
      modelMesh.rotateY(Math.PI);
      modelMesh.scale.setScalar(0.4);
      modelMesh.position.y += 0.8;
      modelMesh.position.z -= 0.5;

      this.parent.mesh.add(modelMesh);

      this.setAnimationMixer(this.model);
    }
    this.dispatchEvent({ type: "loaded" });
  }

  private setAnimationMixer(model: GLTF): void {
    const animationMixer = new AnimationMixer(model.scene);
    this.animationMixer = animationMixer;

    model.animations.forEach((animation) => {
      this.animationActions.set(
        animation.name as ArmsAnimationKey,
        animationMixer.clipAction(animation),
      );
    });

    this.animationMixer.addEventListener(
      "finished",
      this.handleAnimationComplete,
    );

    this.setInitialAnimationPosition();
  }

  private setCurrentActionName(name: ArmsAnimationKey): void {
    this.currentActionName = name;

    const animationMetadata = PlayerAnimations[name];
    this.animationTimeScale = animationMetadata.timeScale ?? 1;
    this.animationRepetitions = animationMetadata.repetitions ?? Infinity;
  }

  private setInitialAnimationPosition(): void {
    this.currentActionName = "Unequip_Sword";
    this.currentAction = this.animationActions.get(this.currentActionName)!;
    this.currentAction.play();
    this.currentAction.time = this.currentAction!.getClip().duration;
    this.animationMixer?.update(0);
  }

  private handleAnimationComplete(event: { action: AnimationAction }): void {
    if (event.action.getClip().name !== "Idle") {
      this.setCurrentActionName("Idle");
    }
  }

  private changeAnimation(): void {
    if (this.currentActionName && !this.currentAction) {
      // start first animation
      this.currentAction = this.animationActions.get(this.currentActionName);
      this.currentAction?.play().fadeIn(1);
    } else if (this.currentActionName && this.currentAction) {
      // transition between animations
      const newAction = this.animationActions?.get(this.currentActionName);
      const oldAction = this.currentAction;
      newAction?.reset().play().crossFadeFrom(oldAction, 0.2, true);
      this.currentAction = newAction;
    } else if (!this.currentActionName) {
      // stop animations
      this.currentAction?.reset().fadeOut(1);
      this.currentAction = undefined;
    }

    if (this.currentAction) {
      this.currentAction.setEffectiveTimeScale(this.animationTimeScale);
      this.currentAction.repetitions = this.animationRepetitions;
      this.currentAction.clampWhenFinished = true;
    }
  }
}

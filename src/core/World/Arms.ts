import { GLTF } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
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
import Camera from "../Camera";
import {
  PlayerState,
  PlayerStateEvent,
  PlayerStateMachine,
} from "../constants/PlayerStateMachine";
import { PlayerStateToAnimationMap } from "../constants/PlayerStateToAnimationMap";

export default class Arms extends Watchable {
  private readonly resources: Resources;
  private readonly time: Time;
  private readonly camera: Camera;
  private parent: PhysicalEntity;
  private model?: GLTF;
  private animationMixer?: AnimationMixer;
  private animationActions: Map<ArmsAnimationKey, AnimationAction> = new Map();
  private currentActionName?: ArmsAnimationKey;
  private currentAction?: AnimationAction;
  private animationRepetitions: number = Infinity;
  private animationTimeScale: number = 1;
  private weapon?: Weapon;
  private stateMachine: PlayerStateMachine = new PlayerStateMachine(
    PlayerState.NONE,
  );

  constructor(parent: PhysicalEntity) {
    super();
    this.parent = parent;
    const experience = new Experience();
    this.camera = experience.camera;

    this.resources = experience.resources;
    this.time = experience.time;

    this.loadModel();

    this.handleAnimationComplete = this.handleAnimationComplete.bind(this);
  }

  hit(): void {
    this.transitionState(PlayerStateEvent.ATTACK);
  }

  throw(): void {
    this.transitionState(PlayerStateEvent.THROW);
  }

  setWeapon(weapon: Weapon): void {
    this.weapon = weapon;
    const rightHandBone = this.model?.scene.getObjectByName("Right_Ombro019");
    if (!rightHandBone) {
      console.error("Right hand bone not found in the model.");
      return;
    }
    if (!weapon.mesh) {
      console.error("Weapon mesh is not defined.");
      return;
    }

    this.transitionState(PlayerStateEvent.DRAW_SWORD);
    rightHandBone.add(weapon.mesh);
  }

  update(): void {
    if (this.currentActionName !== this.currentAction?.getClip().name) {
      this.changeAnimation();
    }

    this.animationMixer?.update(this.time.delta);
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

      this.setupAnimations(this.model);
      this.transitionState(PlayerStateEvent.UNEQUIP_SWORD);
    }
    this.dispatchEvent({ type: "loaded" });
  }

  private setupAnimations(model: GLTF): void {
    const animationMixer = new AnimationMixer(model.scene);
    this.animationMixer = animationMixer;

    model.animations.forEach((animation) => {
      this.animationActions.set(
        animation.name as ArmsAnimationKey,
        animationMixer.clipAction(animation),
      );

      if (animation.name === "Attack_01") {
        const throwAction = THREE.AnimationUtils.subclip(
          animation,
          "Throw",
          0,
          13,
          30,
        );
        this.animationActions.set(
          "Throw",
          animationMixer.clipAction(throwAction),
        );
      }
    });

    this.animationMixer.addEventListener(
      "finished",
      this.handleAnimationComplete,
    );
  }

  private setCurrentActionName(name: ArmsAnimationKey): void {
    this.currentActionName = name;

    const animationMetadata = PlayerAnimations[name];
    this.animationTimeScale = animationMetadata.timeScale ?? 1;
    this.animationRepetitions = animationMetadata.repetitions ?? Infinity;
  }

  private handleAnimationComplete(): void {
    this.transitionState(PlayerStateEvent.FINISHED);
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

  private transitionState(event: PlayerStateEvent): void {
    const prevState = this.stateMachine.currentState;

    this.stateMachine.transition(event);

    const newState = this.stateMachine.currentState;

    if (prevState === newState) {
      return;
    }

    if (
      prevState === PlayerState.THROWING &&
      event === PlayerStateEvent.FINISHED
    ) {
      const cameraDirection = this.camera.instance.getWorldDirection(
        new THREE.Vector3(0, 0, 0),
      );
      this.weapon?.throw(cameraDirection);
    }

    const animationKey = PlayerStateToAnimationMap[newState];
    if (animationKey) {
      this.setCurrentActionName(animationKey);
    }
  }
}

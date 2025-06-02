export interface AnimationData<Key = string> {
  actionName: Key;
  repetitions?: number;
  timeScale?: number;
}

export type ArmsAnimationKey =
  | "Idle"
  | "Attack_01"
  | "Attack_02"
  | "Attack_03"
  | "Attack_04"
  | "Draw_sword"
  | "Unequip_Sword";

interface ArmsAnimationData extends AnimationData<ArmsAnimationKey> {
  type: "attack" | "idle" | "movement";
}

export class PlayerAnimations {
  static readonly Idle: ArmsAnimationData = {
    actionName: "Idle",
    type: "idle",
    repetitions: Infinity,
    timeScale: 0.5,
  };
  static readonly Attack_01: ArmsAnimationData = {
    type: "attack",
    actionName: "Attack_01",
    repetitions: 1,
    timeScale: 1,
  };
  static readonly Attack_02: ArmsAnimationData = {
    type: "attack",
    actionName: "Attack_02",
    repetitions: 1,
    timeScale: 1,
  };
  static readonly Attack_03: ArmsAnimationData = {
    type: "attack",
    actionName: "Attack_03",
    repetitions: 1,
    timeScale: 1,
  };
  static readonly Attack_04: ArmsAnimationData = {
    type: "attack",
    actionName: "Attack_04",
    repetitions: 1,
    timeScale: 1,
  };
  static readonly Draw_sword: ArmsAnimationData = {
    type: "movement",
    actionName: "Draw_sword",
    repetitions: 1,
    timeScale: 1,
  };
  static readonly Unequip_Sword: ArmsAnimationData = {
    type: "movement",
    actionName: "Unequip_Sword",
    repetitions: 1,
    timeScale: 1,
  };

  static readonly ALL: Record<ArmsAnimationKey, ArmsAnimationData> = {
    Idle: PlayerAnimations.Idle,
    Attack_01: PlayerAnimations.Attack_01,
    Attack_02: PlayerAnimations.Attack_02,
    Attack_03: PlayerAnimations.Attack_03,
    Attack_04: PlayerAnimations.Attack_04,
    Draw_sword: PlayerAnimations.Draw_sword,
    Unequip_Sword: PlayerAnimations.Unequip_Sword,
  };

  static get ATTACKS(): ArmsAnimationData[] {
    return Object.values(this.ALL).filter(
      (animationData) => animationData.type === "attack",
    );
  }
}

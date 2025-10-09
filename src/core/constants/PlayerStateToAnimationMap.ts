import { ArmsAnimationKey } from "./ArmsAnimations";
import { PlayerState } from "./PlayerStateMachine";

export const PlayerStateToAnimationMap: Partial<
  Record<PlayerState, ArmsAnimationKey>
> = {
  [PlayerState.IDLE]: "Idle",
  [PlayerState.ATTACKING]: "Attack_01",
  [PlayerState.DRAW_SWORD]: "Draw_sword",
  [PlayerState.THROWING]: "Throw",
  [PlayerState.UNEQUIP_SWORD]: "Unequip_Sword",
};

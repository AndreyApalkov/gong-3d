export enum PlayerState {
  NONE = "NONE",
  IDLE = "IDLE",
  DRAW_SWORD = "DRAW_SWORD",
  UNEQUIP_SWORD = "UNEQUIP_SWORD",
  ATTACKING = "ATTACKING",
  THROWING = "THROWING",
}

export enum PlayerStateEvent {
  FINISHED = "finished",
  ATTACK = "attack",
  THROW = "throw",
  DRAW_SWORD = "draw_sword",
  UNEQUIP_SWORD = "unequip_sword",
}

export class PlayerStateMachine {
  public readonly stateTransitions: Record<
    PlayerState,
    Partial<Record<PlayerStateEvent, PlayerState>>
  > = {
    [PlayerState.NONE]: {
      [PlayerStateEvent.DRAW_SWORD]: PlayerState.DRAW_SWORD,
      [PlayerStateEvent.UNEQUIP_SWORD]: PlayerState.UNEQUIP_SWORD,
    },
    [PlayerState.IDLE]: {
      [PlayerStateEvent.ATTACK]: PlayerState.ATTACKING,
      [PlayerStateEvent.THROW]: PlayerState.THROWING,
      [PlayerStateEvent.DRAW_SWORD]: PlayerState.DRAW_SWORD,
    },
    [PlayerState.ATTACKING]: {
      [PlayerStateEvent.FINISHED]: PlayerState.IDLE,
    },
    [PlayerState.THROWING]: {
      [PlayerStateEvent.FINISHED]: PlayerState.DRAW_SWORD,
    },
    [PlayerState.DRAW_SWORD]: {
      [PlayerStateEvent.FINISHED]: PlayerState.IDLE,
    },
    [PlayerState.UNEQUIP_SWORD]: {
      [PlayerStateEvent.FINISHED]: PlayerState.NONE,
    },
  };

  constructor(public currentState: PlayerState) {}

  transition(event: PlayerStateEvent): void {
    const nextState = this.stateTransitions[this.currentState][event];

    if (nextState) {
      this.currentState = nextState;
    }
  }
}

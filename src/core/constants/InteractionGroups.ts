import { CollisionGroups } from "./CollisionGroups";

export class InteractionGroups {
  static readonly GROUND = this.createMask(
    CollisionGroups.GROUND,
    CollisionGroups.ALL,
  );

  static readonly PLAYER = this.createMask(
    CollisionGroups.PLAYER,
    CollisionGroups.GROUND |
      CollisionGroups.WALL |
      CollisionGroups.DYNAMIC_OBJECT |
      CollisionGroups.ENEMY,
  );

  static readonly PLAYER_WEAPON = this.createMask(
    CollisionGroups.WEAPON,
    CollisionGroups.ENEMY | CollisionGroups.DYNAMIC_OBJECT,
  );

  static readonly ENEMY = this.createMask(
    CollisionGroups.ENEMY,
    CollisionGroups.GROUND |
      CollisionGroups.WALL |
      CollisionGroups.ENEMY |
      CollisionGroups.PLAYER |
      CollisionGroups.WEAPON |
      CollisionGroups.DYNAMIC_OBJECT,
  );

  static readonly DYNAMIC_OBJECT = this.createMask(
    CollisionGroups.DYNAMIC_OBJECT,
    CollisionGroups.ALL,
  );

  /**
   * Utility method to create a packed 32-bit bitmask
   * @param membership - Groups the collider is part of
   * @param filter - Groups the collider can interact with
   * @returns Packed 32-bit bitmask
   */
  static createMask(membership: number, filter: number): number {
    return (membership << 16) | filter;
  }
}

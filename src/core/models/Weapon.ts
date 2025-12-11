import { Object3D, Vector3 } from "three";

export interface Weapon {
  throw(velocity: Vector3): void;
  update(): void;
  mesh: Object3D | undefined;
}

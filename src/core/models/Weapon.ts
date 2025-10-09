import { Object3D, Vector3 } from "three";
import { Watchable } from "../Utils/LoadWatcher";

export interface Weapon extends Watchable {
  throw(direction: Vector3): void;
  update(): void;
  mesh: Object3D | undefined;
}

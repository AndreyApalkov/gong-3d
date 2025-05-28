import { Object3D } from "three";
import { Watchable } from "../Utils/LoadWatcher";

export interface Weapon extends Watchable {
  update(): void;
  mesh: Object3D | undefined;
}

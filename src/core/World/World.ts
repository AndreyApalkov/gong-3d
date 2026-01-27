import * as THREE from "three";
import Entity from "../models/Entity";
import { ChristmasTree } from "./ChristmasTree";
import Environment from "./Environment";
import Floor from "./Floor";

import Gong from "./Gong";
import { Gramophone } from "./Gramophone";

export default class World {
  private objects: Entity[] = [];

  public environment?: Environment;
  public floor?: Floor;
  public christmasTree?: ChristmasTree;
  public gramophone?: Gramophone;

  constructor() {
    this.setup();
  }

  update(): void {
    this.christmasTree?.update();
    this.gramophone?.update();
    this.environment?.update();

    this.objects.forEach((object) => object.update());
  }

  addObject(object: Entity): void {
    this.objects.push(object);
  }

  private setup(): void {
    this.environment = new Environment();
    this.floor = new Floor();
    this.christmasTree = new ChristmasTree(new THREE.Vector3(-8, 0, 2));
    this.gramophone = new Gramophone(new THREE.Vector3(8, 0, 2));
    this.christmasTree.setVisible(false);

    this.objects = [new Gong()];
  }
}

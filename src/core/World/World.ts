import * as THREE from "three";
import Entity from "../models/Entity";
import { ChristmasTree } from "./ChristmasTree";
import Environment from "./Environment";
import Floor from "./Floor";
import { Palm } from "./Palm";
import Water from "./Water";

import Gong from "./Gong";
import { Gramophone } from "./Gramophone";

export default class World {
  private objects: Entity[] = [];

  public environment?: Environment;
  public floor?: Floor;
  public water?: Water;
  public christmasTree?: ChristmasTree;
  public gramophone?: Gramophone;
  public palm?: Palm;

  constructor() {
    this.setup();
  }

  update(): void {
    this.christmasTree?.update();
    this.gramophone?.update();
    this.palm?.update();
    this.environment?.update();
    this.water?.update();

    this.objects.forEach((object) => object.update());
  }

  addObject(object: Entity): void {
    this.objects.push(object);
  }

  private setup(): void {
    this.environment = new Environment();
    this.floor = new Floor();
    this.water = new Water();
    this.christmasTree = new ChristmasTree(new THREE.Vector3(-8, 0, 2));
    this.gramophone = new Gramophone(new THREE.Vector3(8, 3, 2));
    this.palm = new Palm(new THREE.Vector3(-12, 0, -10));
    this.christmasTree.setVisible(false);
    this.palm.setVisible(false);

    this.objects = [new Gong()];
  }
}

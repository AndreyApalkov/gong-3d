import type { TempContactForceEvent } from "@dimforge/rapier3d";
import Experience from "./Experience";
import PhysicalWorld from "./PhysicalWorld";

type ForceHandler = (event: TempContactForceEvent) => void;
type ContactHandler = () => void;

export class CollisionManager {
  private readonly colliderToContactHandlerMap: Map<number, ContactHandler> =
    new Map();
  private readonly colliderToForceHandlerMap: Map<number, ForceHandler> =
    new Map();
  private readonly physicalWorld: PhysicalWorld;

  constructor() {
    const experience = new Experience();
    this.physicalWorld = experience.physicalWorld;
  }

  registerContactForceHandler(colliderId: number, handler: ForceHandler): void {
    this.colliderToForceHandlerMap.set(colliderId, handler);
  }

  registerContactHandler(colliderId: number, handler: ContactHandler): void {
    this.colliderToContactHandlerMap.set(colliderId, handler);
  }

  checkCollisions(): void {
    this.physicalWorld.eventQueue.drainContactForceEvents((event) => {
      const collider1Id = event.collider1();
      const collider2Id = event.collider2();

      const handler =
        this.colliderToForceHandlerMap.get(collider1Id) ||
        this.colliderToForceHandlerMap.get(collider2Id);

      handler?.(event);
    });

    this.physicalWorld.eventQueue.drainCollisionEvents(
      (handle1, handle2, started) => {
        if (!started) {
          return;
        }

        const handler =
          this.colliderToContactHandlerMap.get(handle1) ||
          this.colliderToContactHandlerMap.get(handle2);

        handler?.();
      },
    );
  }
}

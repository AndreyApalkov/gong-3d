import EventEmitter from "eventemitter3";
import { ResourcesEvent } from "./Resources";
import { SizesEvent } from "./Sizes";
import { TimeEvent } from "./Time";
import { GongEvent } from "../World/Gong";

type EventType = ResourcesEvent | SizesEvent | TimeEvent | GongEvent;

export class EventsManager extends EventEmitter<EventType> {
  constructor() {
    super();
  }
}

export default new EventsManager();

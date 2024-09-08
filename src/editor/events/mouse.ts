import { Coordinate } from "../types";

type EventName = "down" | "move";

export class Mouse {
  private listeners: Record<string, Function[]> = {};
  private isPressed = false;

  constructor(root: HTMLElement) {
    root.addEventListener("pointermove", (event) => {
      if (!this.isPressed) {
        return;
      }

      this.emit("move", {
        x: event.layerX,
        y: event.layerY,
      });
    });

    root.addEventListener("pointerdown", (event) => {
      this.isPressed = true;
      this.emit("down", {
        x: event.layerX,
        y: event.layerY,
      });
    });

    root.addEventListener("pointerup", () => {
      this.isPressed = false;
    });
  }

  on<Event extends EventName>(
    eventName: Event,
    callback: (payload: Coordinate) => void
  ) {
    this.listeners[eventName] ??= [];
    this.listeners[eventName].push(callback);
  }

  private emit<Event extends EventName>(eventName: Event, arg: Coordinate) {
    this.listeners[eventName]?.forEach((callback) => callback(arg));
  }
}

type ChangeEventName = "change";
type ArrowEventName = "right" | "up" | "left" | "down";
type EventName =
  | "focus"
  | "blur"
  | "backspace"
  | ArrowEventName
  | ChangeEventName;

type EmitArgument<Event extends EventName> = Event extends ChangeEventName
  ? string
  : Event extends ArrowEventName
  ? {
      isControl: boolean;
      isShift: boolean;
    }
  : void;

type Callback<Event extends EventName> = Event extends ChangeEventName
  ? (key: string) => void
  : Event extends ArrowEventName
  ? (meta: { isControl: boolean; isShift: boolean }) => void
  : () => void;

const SpecialKeys: Record<string, EventName> = {
  Backspace: "backspace",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowLeft: "left",
  ArrowDown: "down",
} as const;

export class Keyboard {
  private listeners: Record<string, Function[]> = {};
  private isFocused: boolean = false;
  private pressedKeys = new Set<string>();

  constructor(root: HTMLElement) {
    const keydownListener = (event: KeyboardEvent) => {
      this.pressedKeys.add(event.key);

      if (event.key in SpecialKeys) {
        this.emit(SpecialKeys[event.key], {
          isControl: event.metaKey || event.ctrlKey,
          isShift: event.shiftKey,
        });
        return;
      }

      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      this.emit("change", event.key);
    };

    const keyupListener = (event: KeyboardEvent) => {
      this.pressedKeys.delete(event.key);
    };

    document.addEventListener("click", () => {
      this.emit("blur");
      this.isFocused = false;
      document.removeEventListener("keydown", keydownListener);
      document.removeEventListener("keyup", keyupListener);
    });

    root.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();

      if (this.isFocused) {
        return;
      }

      this.emit("focus");
      this.isFocused = true;
      document.addEventListener("keydown", keydownListener);
      document.addEventListener("keyup", keyupListener);
    });
  }

  on<Event extends EventName>(eventName: Event, callback: Callback<Event>) {
    this.listeners[eventName] ??= [];
    this.listeners[eventName].push(callback);
  }

  private emit<Event extends EventName>(
    eventName: Event,
    arg?: EmitArgument<Event>
  ) {
    this.listeners[eventName]?.forEach((callback) => callback(arg));
  }
}

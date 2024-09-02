type ChangeEventName = "change";
type EventName =
  | "focus"
  | "blur"
  | "backspace"
  | "right"
  | "up"
  | "left"
  | "down"
  | ChangeEventName;

type EmitArgument<Event extends EventName> = Event extends ChangeEventName
  ? string
  : void;

type Callback<Event extends EventName> = Event extends ChangeEventName
  ? (key: string) => void
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

  constructor(root: HTMLElement) {
    const keydownListener = (event: KeyboardEvent) => {
      if (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      if (event.key in SpecialKeys) {
        this.emit(SpecialKeys[event.key]);
        return;
      }

      this.emit("change", event.key);
    };

    document.addEventListener("click", () => {
      this.emit("blur");
      this.isFocused = false;
      document.removeEventListener("keydown", keydownListener);
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

type ChangeEventName = "change";
type ArrowEventName = "right" | "up" | "left" | "down";
type PasteEventName = "paste";
type BackspaceEventName = "backspace";
type EventName =
  | "focus"
  | "blur"
  | BackspaceEventName
  | PasteEventName
  | ArrowEventName
  | ChangeEventName;

type EmitArgument<Event extends EventName> = Event extends ChangeEventName
  ? string
  : Event extends ArrowEventName
  ? ArrowEventPayload
  : Event extends PasteEventName
  ? string
  : Event extends BackspaceEventName
  ? Pick<ArrowEventPayload, "isControl">
  : void;

export type ArrowEventPayload = { isControl: boolean; isShift: boolean };

type Callback<Event extends EventName> = Event extends ChangeEventName
  ? (key: string) => void
  : Event extends ArrowEventName
  ? (meta: ArrowEventPayload) => void
  : Event extends PasteEventName
  ? (value: string) => void
  : Event extends BackspaceEventName
  ? (meta: Pick<ArrowEventPayload, "isControl">) => void
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
    const keydownListener = async (event: KeyboardEvent) => {
      this.pressedKeys.add(event.key);

      if (event.key in SpecialKeys) {
        this.emit(SpecialKeys[event.key], {
          isControl: event.metaKey || event.ctrlKey,
          isShift: event.shiftKey,
        });
        return;
      }

      if (event.key === "v" && event.metaKey) {
        const content = await navigator.clipboard.readText();
        this.emit("paste", content);
      }

      if (event.metaKey || event.altKey || event.ctrlKey) {
        return;
      }

      if (event.key === "Enter") {
        this.emit("change", "\n");
        return;
      }

      if (event.key.length !== 1) {
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

import { Canvas } from "./canvas";
import { Cursor } from "./cursor";
import { Font } from "./font";
import { Keyboard } from "./keyboard";
import { Storage } from "./storage";
import { View } from "./view";

type EditorProperties = {
  class?: string;
  paddingX?: number;
  paddingY?: number;
};

export class Editor {
  private wrapper: HTMLDivElement;
  private storage: Storage;
  private canvas: Canvas;
  private cursor: Cursor;
  private keyboard: Keyboard;
  private font: Font;
  private view: View;

  constructor(root: Element, properties: EditorProperties) {
    this.wrapper = this.setupWrapper(root, properties);
    this.storage = new Storage(
      "Velit ipsum culpa eiusmod esse aliqua deserunt occaecat enim nulla labore sunt ipsum amet.\nId ut ex cillum velit veniam fugiat qui tempor elit consectetur consectetur ullamco consequat reprehenderit aliquip.\nLorem sunt dolor reprehenderit labore deserunt anim ipsum ipsum nisi occaecat.\nNisi occaecat nisi adipisicing ex\nelit cupidatat laborum dolor mollit dolor dolore est."
    );

    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;

    this.canvas = new Canvas(width, height, this.wrapper);
    this.font = new Font(this.wrapper, {
      family: "Roboto Mono",
      size: 16,
    });

    this.canvas.setFont(this.font);
    this.view = new View(
      { width, height },
      { x: properties.paddingX ?? 0, y: properties.paddingY ?? 0 },
      this.storage
    );

    this.cursor = new Cursor(this.wrapper, {
      color: "#f00",
      font: this.font,
      view: this.view,
    });

    this.keyboard = new Keyboard(this.wrapper);
    this.setupKeyboardEvents();

    this.print();
  }

  print() {
    this.canvas.clearAll();
    const lines = this.storage.read();

    for (const index_ in lines) {
      const index = Number(index_);
      const line = lines[index];

      const { x, y } = this.calculateTextCoordinates(0, index);
      this.canvas.printLine(line, x, y);
    }
  }

  private setupKeyboardEvents() {
    this.keyboard.on("focus", this.focusHandler.bind(this));
    this.keyboard.on("blur", this.blurHandler.bind(this));

    this.keyboard.on("right", ({ isControl }) => {
      this.cursor.right(isControl);
    });

    this.keyboard.on("left", ({ isControl }) => {
      this.cursor.left(isControl);
    });

    this.keyboard.on("up", ({ isControl }) => {
      this.cursor.up(isControl);
    });

    this.keyboard.on("down", ({ isControl }) => {
      this.cursor.down(isControl);
    });

    this.keyboard.on("backspace", () => {
      const position = this.cursor.getPosition();

      this.cursor.left();
      this.storage.delete(position);
      this.print();
    });

    this.keyboard.on("change", (key) => {
      const position = this.cursor.getPosition();

      this.storage.insert(key, position);
      this.print();
      this.cursor.right();
    });
  }

  private calculateTextCoordinates(
    character: number,
    line: number
  ): { x: number; y: number } {
    return {
      x: character * this.font.characterWidth + this.view.offset.x,
      y: (line + 1) * this.font.lineHeight + this.view.offset.y,
    };
  }

  private focusHandler() {
    this.cursor.turnVisible();
  }

  private blurHandler() {
    this.cursor.turnInvisible();
  }

  private setupWrapper(root: Element, properties: EditorProperties) {
    const wrapper = document.createElement("div");

    wrapper.style.position = "relative";
    if (properties.class) {
      wrapper.classList.add(...properties.class.split(" "));
    }

    root.append(wrapper);
    return wrapper;
  }
}

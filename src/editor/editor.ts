import { Canvas } from "./canvas";
import { Cursor } from "./cursor/cursor";
import { Font } from "./font";
import { ArrowEventPayload, Keyboard } from "./events/keyboard";
import { Storage } from "./storage";
import { View } from "./view";
import { Mouse } from "./events/mouse";

type EditorProperties = {
  class?: string;
  paddingX?: number;
  paddingY?: number;
};

export class Editor {
  private container: HTMLDivElement;
  private wrapper: HTMLDivElement;
  private storage: Storage;
  private canvas: Canvas;
  private cursor: Cursor;
  private keyboard: Keyboard;
  private font: Font;
  private view: View;
  private mouse: Mouse;

  constructor(root: Element, properties: EditorProperties) {
    this.container = this.setupContainer(root, properties);

    this.wrapper = this.setupWrapper(this.container, properties);

    this.storage = new Storage(
      "Velit ipsum culpa eiusmod esse aliqua deserunt occaecat enim nulla labore sunt ipsum amet.\nId ut ex cillum velit veniam fugiat qui tempor elit consectetur consectetur ullamco consequat reprehenderit aliquip.\nLorem sunt dolor reprehenderit labore deserunt anim ipsum ipsum nisi occaecat.\nNisi occaecat nisi adipisicing exelit cupidatat laborum dolor mollit dolor dolore est.\nDo magna sit culpa do non duis.\nLorem ut esse officia veniam esse aute aliqua aute veniam excepteur magna culpa pariatur.\nAd occaecat fugiat in mollit nostrud occaecat eu anim occaecat proident officia ex consequat.\nPariatur occaecat aliquip qui cupidatat nulla anim incididunt non.\nSit dolore incididunt cupidatat ullamco commodo sit laboris non ipsum ea enim.\nUt est labore occaecat occaecat tempor exercitation.\n Culpa ipsum tempor deserunt incididunt commodo incididunt occaecat minim consectetur.\nElit ullamco commodo cupidatat sunt occaecat mollit eiusmod eu eu do dolor.\nProident ex aute eiusmod officia quis minim anim amet.\nFugiat pariatur nulla occaecat cillum amet.\nLabore minim culpa dolor irure ullamco deserunt veniam dolore cillum duis ea ad.\nAdipisicing fugiat sint do Lorem ipsum eiusmod eu nulla anim eiusmod ut ipsum ad cupidatat.\nCulpa anim ex nulla eu nostrud.\nEa do elit ipsum duis nisi exercitation mollit et quis ad et duis deserunt.\nEt esse cillum ea.\nLaboris et enim qui cupidatat elit non.\nOccaecat irure ipsum dolor reprehenderit Lorem consequat non aliqua ipsum aute labore nulla sunt cillum.\nEu qui anim adipisicing anim reprehenderit magna sunt in laborum ea.\nAliqua magna ipsum ea nostrud culpa nulla fugiat.\nIncididunt minim cillum consequat velit esse non consectetur nulla est culpa.\nConsectetur quis voluptate culpa duis culpa quis.\nNisi ut tempor ex est adipisicing minim in officia excepteur cillum anim dolore id reprehenderit.\nDuis proident sit dolore sunt eu cupidatat."
    );

    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;

    this.canvas = new Canvas(width, height, this.wrapper);

    this.font = new Font(this.wrapper, {
      family: "Roboto Mono",
      size: 16,
    });

    this.canvas.setFont(this.font);
    this.view = new View({ width, height }, this.font, this.storage);

    this.cursor = new Cursor(this.wrapper, {
      color: "#5e9cb0",
      font: this.font,
      view: this.view,
    });

    this.keyboard = new Keyboard(this.wrapper);
    this.setupKeyboardEvents();

    this.mouse = new Mouse(this.container);
    this.setupMouseEvents();

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

    if (lines.length === 0) {
      const { x, y } = this.calculateTextCoordinates(0, 0);
      this.canvas.printPlaceholder("Enter your thoughts here...", x, y);
    }
  }

  private setupKeyboardEvents() {
    this.keyboard.on("focus", this.focusHandler.bind(this));
    this.keyboard.on("blur", this.blurHandler.bind(this));

    this.keyboard.on(
      "right",
      this.handleCursorMovemenet(({ isControl }) => {
        if (isControl) {
          this.cursor.edge("right");
        } else {
          this.cursor.right(this.cursor.getActivePosition().character + 1);
        }
      })
    );

    this.keyboard.on(
      "left",
      this.handleCursorMovemenet(({ isControl }) => {
        if (isControl) {
          this.cursor.edge("left");
        } else {
          this.cursor.left(this.cursor.getActivePosition().character - 1);
        }
      })
    );

    this.keyboard.on(
      "up",
      this.handleCursorMovemenet(({ isControl }) => {
        if (isControl) {
          this.cursor.edge("top");
        } else {
          this.cursor.up(this.cursor.getActivePosition().line - 1);
        }
      })
    );

    this.keyboard.on(
      "down",
      this.handleCursorMovemenet(({ isControl }) => {
        if (isControl) {
          this.cursor.edge("bottom");
        } else {
          this.cursor.down(this.cursor.getActivePosition().line + 1);
        }
      })
    );

    this.keyboard.on("paste", (value) => {
      const position = this.cursor.getActivePosition();

      this.storage.insert(value, position);
      this.cursor.right(
        this.cursor.getActivePosition().character + value.length
      );
      this.print();
    });

    this.keyboard.on("backspace", ({ isControl }) => {
      const position = this.cursor.getFullPosition();

      if (this.cursor.getMode() === "single") {
        if (isControl) {
          this.cursor.left(0);
          this.storage.deleteRange(
            {
              character: 0,
              line: position[0].line,
            },
            position[0]
          );
        } else {
          this.cursor.left(position[0].character - 1);
          this.storage.delete(position[0]);
        }
      } else {
        this.storage.deleteRange(position[0], position[1]);
        this.cursor.setPosition(position[0]);
      }

      this.cursor.setMode("single");
      this.print();
    });

    this.keyboard.on("change", (key) => {
      const position = this.cursor.getActivePosition();

      this.storage.insert(key, position);
      this.cursor.right(this.cursor.getActivePosition().character + 1);
      this.print();
    });
  }

  private setupMouseEvents() {
    this.mouse.on("down", (coordinates) => {
      this.cursor.setMode("single");

      this.cursor.setPosition(this.view.coordinatesToPosition(coordinates));
    });

    this.mouse.on("move", (coordinates) => {
      this.cursor.setMode("range");

      const offset = { ...this.view.offset };

      this.cursor.setPosition(
        this.view.coordinatesToPosition(coordinates),
        this.cursor.getInactivePosition()!
      );

      if (offset.x !== this.view.offset.x || offset.y !== this.view.offset.y) {
        this.print();
      }
    });
  }

  private handleCursorMovemenet(
    callback: (properties: ArrowEventPayload) => void
  ) {
    return (properties: ArrowEventPayload) => {
      if (properties.isShift) {
        this.cursor.setMode("range");
      } else {
        this.cursor.setMode("single");
      }

      const offset = { ...this.view.offset };
      callback(properties);

      if (!this.view.isOffsetSame(offset)) {
        this.print();
      }
    };
  }

  private calculateTextCoordinates(
    character: number,
    line: number
  ): { x: number; y: number } {
    return {
      x: (character - this.view.offset.x) * this.font.characterWidth,
      y: (line + 1 - this.view.offset.y) * this.font.lineHeight,
    };
  }

  private focusHandler() {
    this.cursor.turnVisible();
  }

  private blurHandler() {
    this.cursor.turnInvisible();
  }

  private setupContainer(root: Element, properties: EditorProperties) {
    const wrapper = document.createElement("div");

    wrapper.style.position = "relative";
    if (properties.class) {
      wrapper.classList.add(...properties.class.split(" "));
    }

    root.append(wrapper);
    return wrapper;
  }

  private setupWrapper(root: Element, properties: EditorProperties) {
    const wrapper = document.createElement("div");

    wrapper.style.position = "relative";
    const paddingX = properties.paddingX ?? 0;
    const paddingY = properties.paddingY ?? 0;

    wrapper.style.width = `${root.clientWidth - paddingX * 2}px`;
    wrapper.style.height = `${root.clientHeight - paddingY * 2}px`;
    wrapper.style.margin = `${paddingY}px ${paddingX}px`;

    root.append(wrapper);
    return wrapper;
  }
}

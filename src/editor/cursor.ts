import type { Font } from "./font";
import type { View } from "./view";
import type { Position } from "./types";

type CursorProperties = {
  color: string;
  font: Font;
  view: View;
};

const BLINK_INTERVAL = 500;

export class Cursor {
  private position: Position = { character: 0, line: 0 };
  private view: View;
  private isVisible = false;

  private blinkIntervalId?: number;
  private element: HTMLDivElement;

  private characterWidth: number;
  private lineHeight: number;

  constructor(root: Element, { color, font, view }: CursorProperties) {
    const element = document.createElement("div");

    element.style.width = "1px";
    element.style.height = `${font.lineHeight}px`;
    element.style.backgroundColor = color;
    element.style.opacity = "0";
    element.style.transition = "opacity 0.3s ease";
    element.style.position = "absolute";

    this.characterWidth = font.characterWidth;
    this.lineHeight = font.lineHeight;

    this.view = view;

    this.element = element;
    root.append(element);

    this.setPosition({ character: 0, line: 0 });
  }

  turnVisible() {
    if (this.isVisible) {
      return;
    }

    this.isVisible = true;
    this.startBlinking();
  }

  turnInvisible() {
    this.isVisible = false;
    this.stopBlinking();
  }

  setPosition(position: Position) {
    this.position = position;

    this.element.style.left = `${
      this.position.character * this.characterWidth + this.view.offset.x
    }px`;
    this.element.style.top = `${
      this.position.line * this.lineHeight +
      this.view.offset.y +
      this.lineHeight / 4
    }px`;
  }

  getPosition(): Position {
    return this.position;
  }

  right() {
    this.setPosition(
      this.forceEdges({
        character: this.position.character + 1,
        line: this.position.line,
      })
    );
  }

  up() {
    this.setPosition(
      this.forceEdges({
        character: this.position.character,
        line: this.position.line - 1,
      })
    );
  }

  left() {
    this.setPosition(
      this.forceEdges({
        character: this.position.character - 1,
        line: this.position.line,
      })
    );
  }

  down() {
    this.setPosition(
      this.forceEdges({
        character: this.position.character,
        line: this.position.line + 1,
      })
    );
  }

  private forceEdges(position: Position): Position {
    const lines = this.view.getLines();
    const line = Math.max(Math.min(lines - 1, position.line), 0);
    const character = Math.max(
      Math.min(this.view.getLineLength(line), position.character),
      0
    );
    return {
      character,
      line,
    };
  }

  private startBlinking() {
    if (this.blinkIntervalId) {
      clearInterval(this.blinkIntervalId);
    }

    const toggle = () => {
      if (this.element.style.opacity === "0") {
        this.element.style.opacity = "1";
      } else {
        this.element.style.opacity = "0";
      }
    };

    // to start animation without awaiting the first interval
    toggle();

    this.blinkIntervalId = setInterval(() => {
      toggle();
    }, BLINK_INTERVAL);
  }

  private stopBlinking() {
    clearInterval(this.blinkIntervalId);
    this.element.style.opacity = "0";
  }
}

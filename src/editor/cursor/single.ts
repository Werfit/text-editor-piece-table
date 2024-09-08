import type { Font } from "../font";
import type { View } from "../view";
import type { Position } from "../types";
import { GenericCursor } from "./generic";
import { Direction } from "./common";

type CursorProperties = {
  color: string;
  font: Font;
  view: View;
};

type MovementOptions = {
  // flag to define if it's okay to move the cursor to the next line in case if it's out of bounds of the current line
  lineAdjustable?: boolean;
};

const BLINK_INTERVAL = 500;

export class CursorSingle extends GenericCursor {
  private position: Position = { character: 0, line: 0 };

  private isVisible = false;

  private blinkIntervalId?: number;
  private element: HTMLDivElement;

  private characterWidth: number;
  private lineHeight: number;

  constructor(root: HTMLElement, { color, font, view }: CursorProperties) {
    super({ view });
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

    this.doSetPosition({ character: 0, line: 0 });
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
    this.rawMove(position);
  }

  getPosition() {
    return [this.position];
  }

  getActivePosition() {
    return this.position;
  }

  right(to: number) {
    this.rawMove(
      {
        character: to,
        line: this.position.line,
      },
      { lineAdjustable: true }
    );
  }

  up(to: number) {
    this.rawMove({
      character: this.position.character,
      line: to,
    });
  }

  left(to: number) {
    this.rawMove(
      {
        character: to,
        line: this.position.line,
      },
      {
        lineAdjustable: true,
      }
    );
  }

  down(to: number) {
    this.rawMove({
      character: this.position.character,
      line: to,
    });
  }

  edge(direction: Direction) {
    const line = this.position.line;

    if (direction === "top") {
      this.up(0);
      return;
    }

    if (direction === "bottom") {
      this.down(this.view.getLines());
      return;
    }

    if (direction === "left") {
      this.left(0);
      return;
    }

    if (direction === "right") {
      this.right(this.view.getLineLength(line));
      return;
    }
  }

  destroy() {
    this.element.remove();
    if (this.blinkIntervalId !== undefined) {
      clearInterval(this.blinkIntervalId);
    }
  }

  private rawMove(position: Position, options: MovementOptions = {}) {
    const nextPosition = this.forceEdges(position, options);
    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition);
  }

  private doSetPosition(startPosition: Position) {
    this.position = startPosition;

    this.element.style.left = `${
      (this.position.character - this.view.offset.x) * this.characterWidth
    }px`;

    this.element.style.top = `${
      (this.position.line - this.view.offset.y) * this.lineHeight +
      this.lineHeight / 4
    }px`;
  }

  private startBlinking() {
    if (this.blinkIntervalId) {
      clearInterval(this.blinkIntervalId);
    }

    const toggle = () => {
      if (this.element.style.opacity !== "0") {
        this.element.style.opacity = "0";
        return;
      }

      this.element.style.opacity = "1";
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

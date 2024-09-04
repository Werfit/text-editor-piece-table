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

  right(toEdge?: boolean) {
    this.setPosition(
      this.forceEdges(
        {
          character: toEdge
            ? this.view.getLineLength(this.position.line)
            : this.position.character + 1,
          line: this.position.line,
        },
        true
      )
    );
  }

  up(toEdge?: boolean) {
    this.setPosition(
      this.forceEdges({
        character: this.position.character,
        line: toEdge ? 0 : this.position.line - 1,
      })
    );
  }

  left(toEdge?: boolean) {
    this.setPosition(
      this.forceEdges(
        {
          character: toEdge ? 0 : this.position.character - 1,
          line: this.position.line,
        },
        true
      )
    );
  }

  down(toEdge?: boolean) {
    this.setPosition(
      this.forceEdges({
        character: this.position.character,
        line: toEdge ? this.view.getLines() : this.position.line + 1,
      })
    );
  }

  private forceEdges(
    position: Position,
    // flag to define if it's okay to move the cursor to the next line in case if it's out of bounds of the current line
    isLineAdjustable?: boolean
  ): Position {
    const lines = this.view.getLines();
    const line = Math.max(Math.min(lines - 1, position.line), 0);

    // if cursor is moved left out of the borders, move the cursor to the upper line
    if (position.character < 0 && line - 1 >= 0 && isLineAdjustable) {
      return {
        character: this.view.getLineLength(line - 1),
        line: line - 1,
      };
    }

    // if cursor is moved right beyond the line length, move the cursor to lower line
    const lineLength = this.view.getLineLength(line);
    if (
      position.character > lineLength &&
      lines > line + 1 &&
      isLineAdjustable
    ) {
      return {
        character: 0,
        line: line + 1,
      };
    }

    return {
      character: Math.min(Math.max(position.character, 0), lineLength),
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

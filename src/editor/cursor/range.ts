import type { Position } from "../types";
import type { CursorProperties } from "./common";
import { GenericCursor } from "./generic";

export class CursorRange extends GenericCursor {
  private ratio: number = window.devicePixelRatio ?? 1;

  private startPosition: Position = { character: 0, line: 0 };
  private endPosition: Position = { character: 0, line: 0 };

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private characterWidth: number;
  private lineHeight: number;

  private color: string;

  constructor(root: HTMLElement, { color, font, view }: CursorProperties) {
    super({ view });

    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    this.context = context;
    this.color = color;

    this.canvas.width = root.offsetWidth * this.ratio;
    this.canvas.height = root.offsetHeight * this.ratio;

    this.canvas.style.width = `${root.offsetWidth}px`;
    this.canvas.style.height = `${root.offsetHeight}px`;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";

    context.scale(this.ratio, this.ratio);
    root.appendChild(this.canvas);

    this.characterWidth = font.characterWidth;
    this.lineHeight = font.lineHeight;

    this.doSetPosition({ character: 0, line: 0 }, { character: 0, line: 0 });
  }

  setActivePosition(position: Position) {
    const nextPosition = this.forceEdges(position);

    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition, this.endPosition);
  }

  getActivePosition(): Position {
    return this.startPosition;
  }

  getInactivePosition(): Position {
    return this.endPosition;
  }

  setPosition(startPosition: Position, endPosition?: Position) {
    const endPosition_ = endPosition ?? startPosition;
    const nextPosition = this.forceEdges(startPosition, {
      lineAdjustable: true,
    });

    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition, endPosition_);
  }

  getPosition(): [Position, Position] {
    if (this.startPosition.line < this.endPosition.line) {
      return [this.startPosition, this.endPosition];
    }

    if (this.startPosition.line > this.endPosition.line) {
      return [this.endPosition, this.startPosition];
    }

    if (this.startPosition.character < this.endPosition.character) {
      return [this.startPosition, this.endPosition];
    }

    return [this.endPosition, this.startPosition];
  }

  right(to: number) {
    const nextPosition = this.forceEdges(
      {
        character: to,
        line: this.startPosition.line,
      },
      { lineAdjustable: true }
    );

    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition, this.endPosition);
  }

  up(to: number) {
    const nextPosition = this.forceEdges({
      character: this.startPosition.character,
      line: to,
    });

    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition, this.endPosition);
  }

  left(to: number) {
    const nextPosition = this.forceEdges(
      {
        character: to,
        line: this.startPosition.line,
      },
      { lineAdjustable: true }
    );
    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition, this.endPosition);
  }

  down(to: number) {
    const nextPosition = this.forceEdges({
      character: this.startPosition.character,
      line: to,
    });
    this.view.updateView(nextPosition);
    this.doSetPosition(nextPosition, this.endPosition);
  }

  edge(direction: "top" | "right" | "bottom" | "left") {
    const line = this.startPosition.line;

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
    this.canvas.remove();
  }

  private doSetPosition(startPosition: Position, endPosition: Position) {
    this.startPosition = startPosition;
    this.endPosition = endPosition;

    this.clearCanvas();
    this.drawRangeSelection();
  }

  private drawRangeSelection() {
    this.clearCanvas();
    this.context.fillStyle = this.addHexAlpha(this.color, 0.5);

    const [startPosition, endPosition] = this.getPosition();

    for (let line = startPosition.line; line <= endPosition.line; line++) {
      const startCharacter = this.getLineStartCharacter(line);
      const x = (startCharacter - this.view.offset.x) * this.characterWidth;

      const y =
        (line - this.view.offset.y) * this.lineHeight + this.lineHeight / 4;

      const width =
        Math.abs(this.getLineEndPosition(line) - startCharacter) *
        this.characterWidth;
      const height = this.lineHeight;

      this.context.fillRect(x, y, Math.max(width, 1), height);
    }
  }

  private getLineStartCharacter(line: number) {
    const [startPosition, endPosition] = this.getPosition();

    if (line === startPosition.line) {
      return startPosition.character;
    }

    if (line === endPosition.line) {
      return 0;
    }

    return 0;
  }

  private getLineEndPosition(line: number) {
    const [startPosition, endPosition] = this.getPosition();

    if (startPosition.line === endPosition.line) {
      return endPosition.character;
    }

    if (line === startPosition.line) {
      return this.view.getLineLength(line);
    }

    if (line === endPosition.line) {
      return endPosition.character;
    }

    return this.view.getLineLength(line);
  }

  private clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private addHexAlpha(color: string, opacity: number) {
    // coerce values so it is between 0 and 1.
    var _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
  }
}

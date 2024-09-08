import type { Position } from "../types";
import type { CursorProperties, Direction } from "./common";
import { CursorRange } from "./range";
import { CursorSingle } from "./single";

type Mode = "single" | "range";

export class Cursor {
  private cursor: CursorSingle | CursorRange;
  private properties: CursorProperties;
  private root: HTMLElement;
  private mode: Mode = "single";
  private input: HTMLInputElement;

  constructor(root: HTMLElement, properties: CursorProperties) {
    this.root = root;
    this.properties = properties;

    this.cursor = new CursorSingle(this.root, this.properties);
    this.setMode("single");

    this.input = document.createElement("input");
    this.input.style.position = "fixed";
    this.input.style.opacity = "0";
    this.root.appendChild(this.input);
  }

  turnVisible() {
    if (this.cursor instanceof CursorRange) {
      return;
    }

    this.input.focus();
    this.cursor.turnVisible();
  }

  turnInvisible() {
    if (this.cursor instanceof CursorRange) {
      return;
    }

    this.input.focus();
    this.cursor.turnInvisible();
  }

  getFullPosition(): Position[] {
    return this.cursor.getPosition();
  }

  getActivePosition(): Position {
    return this.cursor.getActivePosition();
  }

  getMode() {
    return this.mode;
  }

  setPosition(position: Position) {
    this.cursor.setPosition(position);
  }

  setMode(mode: "single" | "range") {
    if (mode === this.mode) {
      return;
    }

    this.mode = mode;
    const position = this.cursor.getActivePosition();

    this.cursor.destroy();

    if (mode === "single") {
      this.cursor = new CursorSingle(this.root, this.properties);
      this.cursor.turnVisible();
      this.cursor.setPosition(position);
      return;
    }

    this.cursor = new CursorRange(this.root, this.properties);
    this.cursor.setPosition(position);
  }

  right(to: number) {
    this.cursor.right(to);
  }

  up(to: number) {
    this.cursor.up(to);
  }

  left(to: number) {
    this.cursor.left(to);
  }

  down(to: number) {
    this.cursor.down(to);
  }

  edge(direction: Direction) {
    this.cursor.edge(direction);
  }
}

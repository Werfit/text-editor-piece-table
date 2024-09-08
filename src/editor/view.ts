import { Font } from "./font";
import { Storage } from "./storage";
import { Position } from "./types";

type Size = {
  width: number;
  height: number;
};

type Offset = {
  x: number;
  y: number;
};

export class View {
  private _offset: Offset = { x: 0, y: 0 };
  private _size: Size = { width: 0, height: 0 };

  private storage: Storage;
  private font: Font;

  get offset() {
    return this._offset;
  }

  get size() {
    return this._size;
  }

  constructor(size: Size, font: Font, storage: Storage) {
    this.resize(size);
    this.storage = storage;
    this.font = font;
  }

  resize({ width, height }: Size) {
    this._size = { width, height };
  }

  updateView(position: Position) {
    const viewWidth = Math.floor(this._size.width / this.font.characterWidth);
    const viewHeight = Math.floor(this._size.height / this.font.lineHeight);

    if (position.character > viewWidth + this._offset.x) {
      this._offset.x = position.character - viewWidth;

      return true;
    }

    if (position.character < this._offset.x) {
      this._offset.x = position.character;

      return true;
    }

    if (position.line + 1 > viewHeight + this._offset.y) {
      this._offset.y = position.line + 1 - viewHeight;

      return true;
    }

    if (position.line <= this._offset.y) {
      this._offset.y = position.line;

      return true;
    }

    return false;
  }

  getLines() {
    return this.storage.getLinesAmount();
  }

  getLineLength(line: number) {
    return this.storage.getLineLength(line);
  }

  isOffsetSame(offset: Offset) {
    return this.offset.x === offset.x && this.offset.y === offset.y;
  }
}

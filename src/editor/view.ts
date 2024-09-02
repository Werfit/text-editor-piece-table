import { Storage } from "./storage";

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

  get offset() {
    return this._offset;
  }

  get size() {
    return this._size;
  }

  constructor(size: Size, offset: Offset, storage: Storage) {
    this.resize(size, offset);
    this.storage = storage;
  }

  resize({ width, height }: Size, { x, y }: Offset) {
    this._size = { width, height };
    this._offset = { x, y };
  }

  getLines() {
    return this.storage.getLinesAmount();
  }

  getLineLength(line: number) {
    return this.storage.getLineLength(line);
  }
}

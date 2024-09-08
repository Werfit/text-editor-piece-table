import { Position } from "../types";
import { View } from "../view";
import { CursorProperties, Direction, MovementOptions } from "./common";

export abstract class GenericCursor {
  protected view: View;

  constructor(properties: Pick<CursorProperties, "view">) {
    this.view = properties.view;
  }

  abstract getActivePosition(): Position;
  abstract getInactivePosition(): Position | null;
  abstract getPosition(): Position[];
  abstract setPosition(...positions: Position[]): void;

  abstract right(to: number): void;
  abstract left(to: number): void;
  abstract down(to: number): void;
  abstract up(to: number): void;

  abstract edge(direction: Direction): void;

  abstract destroy(): void;

  protected forceEdges(
    position: Position,
    // flag to define if it's okay to move the cursor to the next line in case if it's out of bounds of the current line
    { lineAdjustable }: MovementOptions = {}
  ): Position {
    const lines = this.view.getLines();
    const line = Math.max(Math.min(lines - 1, position.line), 0);

    // if cursor is moved left out of the borders, move the cursor to the upper line
    if (position.character < 0 && line - 1 >= 0 && lineAdjustable) {
      return {
        character: this.view.getLineLength(line - 1),
        line: line - 1,
      };
    }

    // if cursor is moved right beyond the line length, move the cursor to lower line
    const lineLength = this.view.getLineLength(line);
    if (position.character > lineLength && lines > line + 1 && lineAdjustable) {
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
}

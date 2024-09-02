import { Position } from "./types";

enum Source {
  ORIGINAL = "original",
  ADD = "add",
}

class Piece {
  offset: number;
  length: number;
  source: Source;
  next: Piece | null;

  constructor(
    offset: number,
    length: number,
    source: Source,
    next: Piece | null
  ) {
    this.length = length;
    this.offset = offset;
    this.source = source;
    this.next = next;
  }
}

export class Storage {
  original: string = "";
  add: string = "";

  pieceHead: Piece = new Piece(0, 0, Source.ORIGINAL, null);

  constructor(content: string = "") {
    this.original = content;
    this.pieceHead = new Piece(0, content.length, Source.ORIGINAL, null);
  }

  getLineLength(line: number) {
    const lines = this.readLines(line);
    return lines[lines.length - 1].length;
  }

  getLinesAmount() {
    const lines = this.readLines();
    return lines.length;
  }

  read(): string[] {
    return this.readLines();
  }

  insert(content: string, at: Position) {
    const { piece, offset } = this.findPieceByLine(at);

    if (!piece) {
      return;
    }

    const nextPiece = new Piece(
      piece.offset + offset,
      piece.length - offset,
      piece.source,
      piece.next
    );
    const currentPiece = new Piece(
      this.add.length,
      content.length,
      Source.ADD,
      nextPiece
    );
    this.add += content;
    piece.next = currentPiece;
    piece.length = offset;
  }

  private findPieceByLine(position: Position) {
    const { line, character } = position;
    let head: Piece | null = this.pieceHead;
    let currentLine = 0;
    let currentCharacter = 0;

    // searching for the piece that starts the line
    while (head !== null) {
      const source = head.source === Source.ORIGINAL ? this.original : this.add;
      const content = source.slice(head.offset, head.offset + head.length);

      for (let i = 0; i < content.length; i++) {
        const letter = content[i];

        if (currentLine === line && currentCharacter === character) {
          return { piece: head, offset: i };
        }

        if (letter === "\n") {
          currentLine++;
          currentCharacter = 0;
        } else {
          currentCharacter++;
        }
      }

      // if nothing found, let the user type in the end
      if (head.next === null) {
        return { piece: head, offset: head.length };
      }

      head = head.next;
    }

    return { piece: null, offset: 0 };
  }

  // might be a good idea to add caching
  private readLines(amount?: number) {
    let head: Piece | null = this.pieceHead;
    let line = "";
    const lines = [];

    while (head !== null) {
      const source = head.source === Source.ORIGINAL ? this.original : this.add;

      const content = source.slice(head.offset, head.offset + head.length);

      for (const letter of content) {
        if (letter === "\n") {
          lines.push(line);

          if (amount === lines.length - 1) {
            return lines;
          }

          line = "";
          continue;
        }

        line += letter;
      }

      head = head.next;
    }

    if (line !== "") {
      lines.push(line);
    }

    return lines;
  }
}

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

  pieceHead: Piece | null = new Piece(0, 0, Source.ORIGINAL, null);

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
    const { piece, offset, previous } = this.findPieceByLine(at);

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
    piece.length = offset;

    if (previous && piece.length === 0) {
      previous.next = currentPiece;
    } else if (piece.length === 0) {
      this.pieceHead = currentPiece;
    } else {
      piece.next = currentPiece;
    }
  }

  deleteRange(start: Position, end: Position) {
    // should be moved to a single function if performance is needed
    const { piece: startPiece, offset: startOffset } =
      this.findPieceByLine(start);
    const { piece: endPiece, offset: endOffset } = this.findPieceByLine(end);

    if (!startPiece || !endPiece) {
      return;
    }

    if (startPiece === endPiece) {
      if (startOffset === 0) {
        endPiece.offset += endOffset;
        endPiece.length -= endOffset;
        return;
      }

      if (endOffset === startPiece.length) {
        startPiece.length = startOffset;
        return;
      }

      startPiece.next = new Piece(
        startPiece.offset + endOffset,
        startPiece.length - endOffset,
        startPiece.source,
        startPiece.next
      );
      startPiece.length = startOffset;

      return;
    }

    startPiece.length = startOffset;

    endPiece.offset += endOffset;
    endPiece.length -= endOffset;

    let piece = startPiece.next;
    while (piece !== endPiece && piece !== null) {
      startPiece.next = piece.next;
      piece = piece.next;
    }

    if (startPiece.length === 0) {
      this.removePiece(startPiece);
    }

    if (endPiece.length === 0) {
      this.removePiece(endPiece);
    }
  }

  delete(at: Position) {
    const { piece, offset, previous } = this.findPieceByLine(at);

    if (!piece) {
      return;
    }

    if (offset === 0 && previous) {
      this.removeLastCharacterOfPiece(previous);
      return;
    } else if (offset === 0) {
      // cursor is behind the first character in the text
      return;
    }

    if (piece.length === 1 && offset === 1) {
      this.removePiece(piece);
      return;
    }

    if (offset === 1 && piece.length > 0) {
      piece.length--;
      piece.offset++;
      return;
    }

    if (offset === piece.length - 1) {
      piece.length--;
      return;
    }

    const newPiece = new Piece(
      piece.offset + offset,
      piece.length - offset,
      piece.source,
      piece.next
    );

    piece.next = newPiece;
    piece.length = offset - 1;
  }

  private removeLastCharacterOfPiece(piece: Piece) {
    piece.length--;

    if (piece.length === 0) {
      this.removePiece(piece);
    }
  }

  private removePiece(piece: Piece) {
    let head = this.pieceHead;
    let previous = null;

    while (head !== null) {
      if (head === piece) {
        if (previous) {
          previous.next = head.next;
        } else {
          this.pieceHead = head.next;
        }
        return;
      }

      previous = head;
      head = head.next;
    }
  }

  private findPieceByLine(position: Position): {
    offset: number;
    piece: Piece | null;
    previous: Piece | null;
  } {
    const { line, character } = position;
    let head: Piece | null = this.pieceHead;
    let previous: Piece | null = null;
    let currentLine = 0;
    let currentCharacter = 0;

    // searching for the piece that starts the line
    while (head !== null) {
      const source = head.source === Source.ORIGINAL ? this.original : this.add;
      const content = source.slice(head.offset, head.offset + head.length);

      for (let i = 0; i < content.length; i++) {
        const letter = content[i];

        if (currentLine === line && currentCharacter === character) {
          return { piece: head, offset: i, previous };
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
        return { piece: head, offset: head.length, previous };
      }

      previous = head;
      head = head.next;
    }

    return { piece: null, offset: 0, previous: null };
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

import { Font } from "./font";

export class Canvas {
  private ratio: number = window.devicePixelRatio ?? 1;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(width: number, height: number, root: Element) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = width * this.ratio;
    canvas.height = height * this.ratio;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    context.scale(this.ratio, this.ratio);

    this.canvas = canvas;
    this.context = context!;

    root.appendChild(canvas);
    this.clearAll();
  }

  setFont(font: Font) {
    this.context.font = font.getFont();
  }

  printLine(line: string, x: number, y: number) {
    this.context.fillText(line, x, y);
  }

  clearAll() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = "black";
  }
}

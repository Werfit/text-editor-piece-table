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

    context!.scale(this.ratio, this.ratio);

    this.canvas = canvas;
    this.context = context!;

    root.appendChild(canvas);
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
  }
}

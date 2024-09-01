import { Canvas } from "./canvas";

const WRAPPER_CLASS_NAME = "w-editor" as const;

type EditorProperties = {
  class?: string;
};

export class Editor {
  private wrapper: HTMLDivElement;
  private canvas: Canvas;

  constructor(root: Element, properties: EditorProperties) {
    this.wrapper = this.setupWrapper(root, properties);

    const width = this.wrapper.clientWidth;
    const height = this.wrapper.clientHeight;
    this.canvas = new Canvas(width, height, this.wrapper);
  }

  private setupWrapper(root: Element, properties: EditorProperties) {
    const wrapper = document.createElement("div");
    if (properties.class) {
      wrapper.classList.add(...properties.class.split(" "));
    }

    root.append(wrapper);
    return wrapper;
  }
}

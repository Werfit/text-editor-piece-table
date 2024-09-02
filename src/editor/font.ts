type FontProperties = {
  family: string;
  size: number;
};

export class Font {
  private rootElement: HTMLElement;
  private fontFamily: string = "";
  private size: number = 0;
  private _characterWidth: number = 0;
  private _characterHeight: number = 0;

  get characterWidth() {
    return this._characterWidth;
  }

  get lineHeight() {
    return this._characterHeight;
  }

  constructor(root: HTMLElement, properties: FontProperties) {
    this.rootElement = root;
    this.setFont(properties);
  }

  setFont({ family, size }: FontProperties) {
    const element = document.createElement("span");
    element.style.position = "absolute";
    element.style.opacity = "0";
    element.style.fontFamily = family;
    element.style.fontSize = `${size}px`;

    const content = "AAAAA";
    element.innerHTML = content;
    this.rootElement.append(element);

    this._characterWidth = element.offsetWidth / content.length;
    this._characterHeight = element.offsetHeight;
    this.fontFamily = family;
    this.size = size;

    this.rootElement.removeChild(element);
  }

  getFont() {
    return `${this.size}px ${this.fontFamily}`;
  }
}

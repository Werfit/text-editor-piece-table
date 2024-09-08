import type { Font } from "../font";

import type { View } from "../view";

export type Direction = "top" | "right" | "bottom" | "left";

export type CursorProperties = {
  color: string;
  font: Font;
  view: View;
};

export type MovementOptions = {
  // flag to define if it's okay to move the cursor to the next line in case if it's out of bounds of the current line
  lineAdjustable?: boolean;
};

import "./assets/styles/style.css";

import { Editor } from "./editor/editor";

const application = document.querySelector("#app>main");

if (!application) {
  throw new Error("Application root element is not found");
}

const editor = new Editor(application, {
  class:
    "rounded-t-lg overflow-hidden shadow-xl shadow-gray-extra-light/25 w-[800px] h-[596px] mx-auto",
});

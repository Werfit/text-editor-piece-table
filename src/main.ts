import "./assets/styles/style.css";

import { Editor } from "./editor/editor";

window.addEventListener("load", async () => {
  const application = document.querySelector("#app>main");

  if (!application) {
    throw new Error("Application root element is not found");
  }

  new Editor(application, {
    class:
      "rounded-t-lg overflow-hidden shadow-xl shadow-gray-extra-light/25 max-w-full w-[800px] h-[596px] mx-auto bg-white",
    paddingX: 30,
    paddingY: 20,
  });
});

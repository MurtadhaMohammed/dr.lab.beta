const electron = window.require("electron");
const { ipcRenderer } = electron;

export function send(doc) {
  return new Promise((resolve) => {
    ipcRenderer.once("asynchronous-reply", (_, arg) => {
      resolve(arg);
    });
    ipcRenderer.send("asynchronous-message", doc);
  });
}

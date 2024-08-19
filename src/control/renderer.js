const electron = window.require("electron");
const { ipcRenderer } = electron;

export function send(doc) {
  return new Promise((resolve) => {
    ipcRenderer.once("asynchronous-reply", (_, arg) => {
      console.log(arg, 'argg');
      resolve(arg);
    });
    console.log(doc, 'doc');
    ipcRenderer.send("asynchronous-message", doc);
  });
}

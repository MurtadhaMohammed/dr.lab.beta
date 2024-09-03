const electron = window.require("electron");
const { ipcRenderer, shell } = electron;

export function send(doc) {
  return new Promise((resolve) => {
    ipcRenderer.once("asynchronous-reply", (_, arg) => {
      resolve(arg);
    });
    ipcRenderer.send("asynchronous-message", doc);
  });
}


document.addEventListener('click', function (event) {
  if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
    event.preventDefault()
    shell.openExternal(event.target.href)
  }
})
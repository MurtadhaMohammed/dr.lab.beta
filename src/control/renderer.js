const electron = window.require("electron");
const { ipcRenderer, shell } = electron;

export function send(doc) {
  return new Promise((resolve) => {
    const queryName = doc.query;
    const replyChannel =
      queryName &&
      [
        "getTotalPatients",
        "getTodayVisits",
        "getPendingResults",
        "getTotalVisits",
      ].includes(queryName)
        ? `asynchronous-reply-${queryName}`
        : "asynchronous-reply";

    ipcRenderer.once(replyChannel, (_, arg) => {
      resolve(arg);
    });
    ipcRenderer.send("asynchronous-message", doc);
  });
}

document.addEventListener("click", function (event) {
  if (event.target.tagName === "A" && event.target.href.startsWith("http")) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

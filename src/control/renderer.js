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
        "testByID",
        "getTests",
        "getPackages",
        "setSyncConfig",
      ].includes(queryName)
        ? `asynchronous-reply-${queryName}`
        : "asynchronous-reply";

    ipcRenderer.once(replyChannel, (_, arg) => {
      resolve(arg);
    });
    ipcRenderer.send("asynchronous-message", doc);
  });
}

// For queries that never reply (e.g. syncNow) — a send() here would leave a
// stale once-listener that could swallow another query's reply.
export function fireAndForget(doc) {
  ipcRenderer.send("asynchronous-message", doc);
}

export function onSyncStatus(callback) {
  const listener = (_, status) => callback(status);
  ipcRenderer.on("sync-status", listener);
  return () => ipcRenderer.removeListener("sync-status", listener);
}

document.addEventListener("click", function (event) {
  if (event.target.tagName === "A" && event.target.href.startsWith("http")) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

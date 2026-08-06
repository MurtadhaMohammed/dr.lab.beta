import { useEffect, useState } from "react";
import { onSyncStatus, send } from "../control/renderer";

// state: "disabled" | "idle" | "syncing" | "error" | "unauthorized"
export default function useSyncStatus() {
  const [status, setStatus] = useState({ state: "disabled", pending: 0 });

  useEffect(() => {
    // emitStatus only pushes to whatever webContents was registered at the
    // time, so a component mounting after the last sync tick (e.g. opening
    // Settings well after startup) would otherwise be stuck on the default
    // "disabled" state forever. Fetch the current snapshot on mount too.
    let cancelled = false;
    send({ query: "getSyncStatus" }).then((next) => {
      if (!cancelled && next) setStatus(next);
    });

    const unsubscribe = onSyncStatus((next) => setStatus(next));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return status;
}

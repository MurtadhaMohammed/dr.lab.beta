import { useEffect, useState } from "react";
import { onSyncStatus } from "../control/renderer";

// state: "disabled" | "idle" | "syncing" | "error" | "unauthorized"
export default function useSyncStatus() {
  const [status, setStatus] = useState({ state: "disabled", pending: 0 });

  useEffect(() => {
    const unsubscribe = onSyncStatus((next) => setStatus(next));
    return unsubscribe;
  }, []);

  return status;
}

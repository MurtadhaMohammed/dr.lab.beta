import { useEffect, useState } from "react";
import { useAppStore } from "../libs/appStore";

// Increments every `autoRefreshSeconds` (configurable in Settings). Add the
// returned value to a data-fetching effect's dependency array to have that
// screen periodically re-fetch — e.g. so a patient added on another synced
// PC shows up here without navigating away and back.
const useAutoRefreshTick = () => {
  const { autoRefreshSeconds } = useAppStore();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!autoRefreshSeconds || autoRefreshSeconds <= 0) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, autoRefreshSeconds * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSeconds]);

  return tick;
};

export default useAutoRefreshTick;

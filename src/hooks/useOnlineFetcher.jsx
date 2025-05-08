import { useEffect, useState } from "react";

const useOnlineFetcher = (fetchFn) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const checkOnline = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
        fetchFn();
      }
    };

    // Run once on mount
    checkOnline();

    // Run every 12 hours
    const interval = setInterval(checkOnline, 10 * 1000);
    // const interval = setInterval(checkOnline, 12 * 60 * 60 * 1000);

    // Listen to browser online/offline events
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", () => setIsOnline(false));

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, [fetchFn]);

  return isOnline;
};

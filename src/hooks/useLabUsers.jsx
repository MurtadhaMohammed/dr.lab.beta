import { useEffect, useState } from "react";
import { apiCall } from "../libs/api";

export default function useLabUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const resp = await apiCall({
          method: "GET",
          pathname: "/app/users",
          auth: true,
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (!cancelled) setUsers(data.users || []);
      } catch (error) {
        console.error("Error fetching lab users:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { users, loading };
}

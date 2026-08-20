import { useEffect, useState } from "react";
import { apiCall } from "../libs/api";

const initialState = {
  loading: true,
  name: "",
  role: "owner",
  isOwner: true,
  phone: "",
  username: "",
  labName: "",
};

// Legacy (pre-User-model) accounts have no separate operator identity —
// `currentUser` is null for them, and they're always treated as owner,
// matching how they behaved before roles existed.
export default function useCurrentUser() {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const resp = await apiCall({
          method: "POST",
          pathname: "/app/user",
          auth: true,
        });
        if (!resp.ok) return;
        const data = await resp.json();
        if (cancelled) return;

        const currentUser = data.currentUser;
        setState({
          loading: false,
          name: currentUser?.name ?? data.name ?? "",
          role: currentUser?.role ?? "owner",
          isOwner: !currentUser || currentUser.role === "owner",
          phone: data.phone ?? "",
          username: currentUser?.username ?? data.username ?? "",
          labName: data.labName ?? "",
        });
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        if (!cancelled) setState((s) => ({ ...s, loading: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const update = (partial) => setState((s) => ({ ...s, ...partial }));

  return { ...state, update };
}

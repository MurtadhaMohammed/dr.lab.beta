import { message } from "antd";
import { apiCall } from "../libs/api";
import { send, fireAndForget } from "../control/renderer";

// "Leave this lab": disconnects this device from the current clientId on
// the server (so it can no longer sync/re-authenticate with it) and wipes
// the local SQLite database, so an operator moving to a different lab on
// this same PC never carries the previous lab's patient data with them.
export const leaveLab = async (setLoading, setIsLogin, navigate) => {
  setLoading(true);
  try {
    const { UUID } = await send({ query: "getUUID" });

    const resp = await apiCall({
      pathname: `/app/leave-lab`,
      method: "POST",
      auth: true,
      isFormData: false,
      data: { device: UUID },
    });

    if (resp.status === 200) {
      send({ query: "setSyncConfig", data: { enabled: false } });
      localStorage.removeItem("lab_token");
      localStorage.removeItem("lab-user");
      setIsLogin(false);
      navigate(-1, { replace: true });
      // Wipes local drlab.db and relaunches the app — fire-and-forget since
      // the app process exits before any reply would arrive.
      fireAndForget({ query: "leaveLab" });
    } else {
      message.error("Something went wrong.");
    }
  } catch (error) {
    console.error(error);
    message.error(error.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};

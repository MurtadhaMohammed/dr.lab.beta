import { jwtDecode } from "jwt-decode";
import { useAppStore } from "./appStore";
import { API_URL } from "../config/apiUrl";

export const URL = API_URL;

export const isTokenValid = (token) => {
  try {
    let { exp } = jwtDecode(token);
    return Date.now() <= exp * 1000;
  } catch (err) {
    return false;
  }
};

// Old (Client-based) tokens don't carry a clientId claim — only new
// (User-based) tokens do, since `id` on a legacy token already IS the
// Client's own id. Used to force a one-time re-login through the new flow.
export const isLegacyToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded?.clientId == null;
  } catch (err) {
    return false;
  }
};

export const apiCall = async ({
  pathname,
  method = "GET",
  data = null,
  isFormData = false,
  auth = false,
}) => {
  try {
    let token = localStorage.getItem("lab_token");
    if (auth && !isTokenValid(token)) {
      localStorage.removeItem("lab_token");
      useAppStore.setState({
        isLogin: false,
      });
      throw new Error("refresh token expired");
    }

    let body;
    const myHeaders = new Headers();

    if (auth) myHeaders.append("Authorization", `Bearer ${token}`);

    if (data && isFormData) {
      body = data;
    } else if (data) {
      myHeaders.append("Content-Type", "application/json");
      body = JSON.stringify(data);
    }

    const res = await fetch(`${URL}${pathname}`, {
      method,
      headers: myHeaders,
      body,
    });

    // Handle non-2xx responses
    // if (!res.ok) {
    //   const extractErrorMessage = await res.json();
    //   throw new Error(extractErrorMessage.message);
    // }

    // Assuming the response is JSON
    // const jsonRes = await res.json();
    return res;
  } catch (error) {
    console.error("API call error:", error);
    throw error; // Propagate the error to the calling function
  }
};

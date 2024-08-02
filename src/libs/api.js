import { jwtDecode } from "jwt-decode";
import { useAppStore } from "./appStore";

// export const URL = "http://localhost:3000/api";
export const URL = "https://dr-lab-apiv2.onrender.com/api";

export const isTokenValid = (token) => {
  try {
    let { exp } = jwtDecode(token);
    return Date.now() <= exp * 1000;
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
      throw Error("refresh token expired");
    }

    let body = undefined;
    const myHeaders = new Headers();

    if (auth) myHeaders.append("Authorization", `Bearer ${token}`);
    if (!!data && isFormData) {
      var formdata = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formdata.append(key, value);
      });
      body = formdata;
    } else if (!!data) {
      myHeaders.append("Content-Type", "application/json");
      body = JSON.stringify(data);
    }

    let res = await fetch(`${URL}${pathname}`, {
      method,
      headers: myHeaders,
      body,
    });

    // let jsonRes = await res.json();
    return res;
  } catch (error) {
    return error;
  }
};

// "07800000001"
// "11111111"

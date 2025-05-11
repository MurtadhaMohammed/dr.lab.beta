import { message } from "antd";
import { apiCall, URL } from "../libs/api";
import { t } from "i18next";

export const signout = async (setSignoutLoading, setIsLogin, navigate) => {
  setSignoutLoading(true);
  try {
    console.log("hello")
    const resp = await apiCall({
      pathname: `/app/logout`,
      method: "POST",
      auth: true,
      isFormData: false,
    });

    if (resp.status === 200) {
      setSignoutLoading(false);
      localStorage.clear();
      setIsLogin(false);
      navigate(-1, { replace: true });
    } else {
      message.error("Something went wrong.");
    }
  } catch (error) {
    console.log(error);
    message.error(error.message || "Something went wrong.");
    setSignoutLoading(false);
  }
};

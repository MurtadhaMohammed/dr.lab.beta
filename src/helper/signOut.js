import { message } from "antd";
import { URL } from "../libs/api"; 
import { t } from "i18next"; 

export const signout = async (setSignoutLoading, setIsLogin, navigate) => {
  setSignoutLoading(true);
  try {
    let username = JSON.parse(localStorage.getItem("lab-user"))?.username;

    if (!username) {
      message.error(t("Usernotfound"));
      return;
    }

    const resp = await fetch(`${URL}/app/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
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

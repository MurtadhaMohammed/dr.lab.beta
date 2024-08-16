
import { useEffect } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { useAppStore } from "../libs/appStore";

const useLogin = () => {
  const { isLogin, setIsLogin, setUser } = useAppStore();

  useEffect(() => {
    const userString = localStorage.getItem("lab-user");
    if (isLogin && userString) {
      try {
        const user = JSON.parse(userString);
        setUser(user);
        // Ensure that lab-exp and other values exist before calling checkExpire
        const exp = localStorage.getItem("lab-exp");
        const labCreated = localStorage.getItem("lab-created");
        if (exp && labCreated) {
          checkExpire(user);
        } else {
          console.warn("Expiration data not found in localStorage.");
          setIsLogin(false);
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setIsLogin(false);
        message.error("Invalid user data found. Please log in again.");
      }
    } else {
      setIsLogin(false);
    }
  }, []);

  const checkExpire = async (user) => {
    try {
      const serialId = localStorage.getItem("lab-serial-id");
      const exp = localStorage.getItem("lab-exp");
      const labCreated = localStorage.getItem("lab-created");

      if (!exp || !labCreated || !serialId) {
        console.warn("Required data missing for expiration check.");
        setIsLogin(false);
        setUser(null);
        return;
      }

      const createdDate = dayjs(labCreated);
      const today = dayjs();
      const dayPassed = today.diff(createdDate, "day");
      const remaining = parseInt(exp, 10) - dayPassed;

      if (!remaining) {
        setIsLogin(false);
        setUser(null);
        return;
      }

      if (user?.type !== "trial") {
        const response = await fetch(
          "https://dr-lab-apiv2.onrender.com/api/app/check-serial-expiration",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ serialId: parseInt(serialId, 10) }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to check serial expiration, status code: ${response.status}`
          );
        }

        const data = await response.json();

        if (data?.expired) {
          message.error("Serial Expired!");
          setIsLogin(false);
        } else {
          setIsLogin(true);
          localStorage.setItem("lab-exp", data?.serial?.exp);
          localStorage.setItem("lab-created", data?.serial?.startAt);
        }
      }
    } catch (error) {
      console.error(
        "Error checking serial expiration:",
        error.message || error
      );
      message.error("Failed to check serial expiration");
      setIsLogin(false);
    }
  };

  return null;
};

export default useLogin;

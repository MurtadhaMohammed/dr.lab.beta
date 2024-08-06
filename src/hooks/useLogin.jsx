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
        checkExpire(user);
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

      const createdDate = dayjs(labCreated);
      const today = dayjs();
      const dayPassed = today.diff(createdDate, "day");
      const remaining = parseInt(exp) - dayPassed;

      if (!remaining) {
        setIsLogin(false);
        setUser(null);
        return;
      }

      if (!serialId && user?.type !== "trial") {
        console.warn("No serial ID found, and user is not on a trial.");
        setIsLogin(false);
        return;
      }

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
        console.error(`API error: ${response.status} ${response.statusText}`);
        throw new Error(
          `Failed to check serial expiration, status code: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Expiration check response:", data);

      if (!data.success) {
        console.error("API returned success: false, data:", data);
        message.error("Failed to retrieve client information.");
        setIsLogin(false);
        return;
      }

      if (data.client.type === "trial") {
        setIsLogin(true);
        localStorage.setItem("lab-exp", data.exp);
        localStorage.setItem("lab-serial-id", data.serialId);
        return;
      }

      const expirationDate = dayjs(data.client.createdAt).add(data.exp, "day");
      const isExpired = dayjs().isAfter(expirationDate);

      if (isExpired) {
        message.error("Serial Expired!");
        setIsLogin(false);
      } else {
        setIsLogin(true);
        localStorage.setItem("lab-exp", data.exp);
        localStorage.setItem("lab-serial-id", data.serialId);
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

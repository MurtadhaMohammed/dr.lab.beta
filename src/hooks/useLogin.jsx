import { useEffect } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { useAppStore } from "../libs/appStore";

const useLogin = () => {
  const { isLogin, setIsLogin, setUser,isOnline } = useAppStore();

  useEffect(() => {
    const userString = localStorage.getItem("lab-user");
    if (isLogin && userString) {
      try {
        const user = JSON.parse(userString);
        setUser(user);

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
  
      // Define the expiration period based on the user type
      const expirationPeriod = user?.type === "trial" ? 7 : 365;
      const remaining = expirationPeriod - dayPassed;
  
      if (remaining <= 0) {
        setIsLogin(false);
        setUser(null);
        message.error("Subscription has expired.");
        return;
      }
  
      if (user?.type !== "trial" && isOnline) {  // Use isOnline from the store
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
  
        if (response.ok) {
          const data = await response.json();
  
          if (data?.expired) {
            message.error("Serial Expired!");
            setIsLogin(false);
            setUser(null);
          } else {
            setIsLogin(true);
            localStorage.setItem("lab-exp", data?.serial?.exp);
            localStorage.setItem("lab-created", data?.serial?.startAt);
          }
        } else {
          console.error("Failed to check serial expiration:", response.statusText);
          message.error("Failed to check serial expiration.");
          setIsLogin(false);
          setUser(null);
        }
      } else if (!isOnline) {
        console.log("Skipping serial check due to offline status.");
      }
    } catch (error) {
      console.error("Error checking serial expiration:", error.message || error);
      message.error("Failed to check serial expiration.");
      setIsLogin(false);
      setUser(null);
    }
  };
  

  return null;
};


export default useLogin;

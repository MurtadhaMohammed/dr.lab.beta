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
        message.error(t("InvalidUserData"));
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
        message.error(t("Subscriptionexpired"));
        return;
      }
  
      const { isOnline } = useAppStore.getState(); // Get the latest online status
  
      if (user?.type !== "trial" && isOnline) {
        // User is online, proceed with serial expiration check
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
          message.error(t("Failedserialexpiration"));
          setIsLogin(false);
          setUser(null);
        }
      } else if (!isOnline) {
        // User is offline, wait for online status to retry
        console.log("User is offline. Will retry when connection is restored.");
  
        const handleOnline = async () => {
          const { isOnline: newIsOnline } = useAppStore.getState(); // Get the latest online status
          if (newIsOnline) {
            console.log("Connection restored. Retrying serial expiration check...");
            window.removeEventListener("online", handleOnline); // Remove the listener after successful check
            await checkExpire(user); // Retry the expiration check
          }
        };
  
        window.addEventListener("online", handleOnline); // Attach the event listener
      }
    } catch (error) {
      console.error("Error checking serial expiration:", error.message || error);
      message.error(t("Failedserialexpiration"));
      setIsLogin(false);
      setUser(null);
    }
  };
  
  

  return null;
};


export default useLogin;

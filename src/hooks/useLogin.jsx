import { useEffect } from "react";
import { useAppStore } from "../libs/appStore";

const useLogin = () => {
  const { setIsLogin, setUser } = useAppStore();

  useEffect(() => {
    const storedToken = localStorage.getItem("lab_token");

    if (storedToken) {
      const decodedToken = JSON.parse(atob(storedToken.split(".")[1]));
      setUser(decodedToken);
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, []);

  return null;
};

export default useLogin;

import { useEffect } from "react";
import { useAppStore } from "../libs/appStore";

const useLogin = () => {
  const { setIsLogin, setUser } = useAppStore();

  useEffect(() => {
    const storedToken = localStorage.getItem("lab_token");
    const labUser = localStorage.getItem("lab-user");

    if (storedToken && labUser) {
      setUser(JSON.parse(labUser) || {});
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, []);

  return null;
};

export default useLogin;

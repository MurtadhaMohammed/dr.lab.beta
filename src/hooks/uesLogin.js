import { useEffect } from "react";
import { message } from "antd";
import dayjs from "dayjs";
import { useAppStore } from "../libs/appStore";

const useLogin = () => {
    const { isLogin, setIsLogin, setUser } = useAppStore();

    useEffect(() => {
        if (isLogin) {
            let userString = localStorage.getItem("lab-user");
            if (userString) setUser(JSON.parse(userString));
        }
    }, [isLogin, setUser]);

    const checkExpire = async () => {
        try {
            const serialId = localStorage.getItem("lab-serial-id");
            if (!serialId) {
                setIsLogin(false);
                return;
            }

            const response = await fetch('https://dr-lab-apiv2.onrender.com/api/client/check-serial-expiration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ serialId: parseInt(serialId) }),
            });

            if (!response.ok) {
                throw new Error('Failed to check serial expiration');
            }

            const data = await response.json();
            const { expired, serial } = data;

            if (expired) {
                message.error("Serial Expired!");
                setIsLogin(false);
            } else {
                const remainingDays = serial.exp;
                const isExp = dayjs().isAfter(dayjs(serial.createdAt).add(remainingDays, "d"));
                if (isExp) {
                    message.error("Serial Expired!");
                    setIsLogin(false);
                } else {
                    setIsLogin(true);
                }
            }
        } catch (error) {
            console.error('Error checking serial expiration:', error);
            message.error('Failed to check serial expiration');
            setIsLogin(false);
        }
    };

    useEffect(() => {
        checkExpire();
    }, [isLogin]);

    return { isLogin };
};

export default useLogin;

import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { apiCall } from "../libs/api";
import { useAppStore } from "../libs/appStore";

export const usePlan = () => {
  const [planType, setPlanType] = useState(); // FREE || SUBSCRIPTION || PAID
  const [printLimit, setPrintLimit] = useState(20);
  const [whatsappLimit, setWhatsappLimit] = useState(0);
  const [subscriptionExpire, setSubscriptionExpire] = useState();
  const [registerAt, setRegisterAt] = useState();
  const { isLogin } = useAppStore();

  useEffect(() => {
    init();
  }, [isLogin]);

  const getUserData = async () => {
    try {
      const resp = await apiCall({
        method: "POST",
        pathname: "/app/user",
        isFormData: false,
        auth: true,
      });

      if (resp.ok) {
        const userData = await resp.json();
        return userData;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const updateData = (userInfo) => {
    let { Plan, balance, whatsappMsgPrice, expiredAt, createdAt } =
      JSON.parse(userInfo) || {};
    setPlanType(Plan?.type);
    setPrintLimit(Plan?.printLimit);
    setSubscriptionExpire(expiredAt);
    setRegisterAt(createdAt);
    setWhatsappLimit(Math.ceil(balance / whatsappMsgPrice) || 0);
  };

  const init = async () => {
    let userInfo = localStorage.getItem("lab-user");
    let userToken = localStorage.getItem("lab_token");

    if (userToken) {
      let resp = await getUserData();
      if (resp) {
        userInfo = JSON.stringify(resp);
        localStorage.setItem("lab-user", userInfo);
      }
      if (userInfo) updateData(userInfo);
    }
  };

  const getWhatsappUsed = () => {
    let count = 0;
    let whatsappUsed = localStorage.getItem("whatsapp-used");
    if (whatsappUsed) count = parseInt(JSON.parse(whatsappUsed), 10) || 0;
    return count;
  };

  const setWhatsappUsed = async () => {
    let whatsappUsed = getWhatsappUsed();
    localStorage.setItem("whatsapp-used", whatsappUsed + 1);
  };

  const canSendWhatsapp = () => {
    let whatsappUsed = getWhatsappUsed();
    if (whatsappUsed >= whatsappLimit && planType !== "FREE") return false;
    return true;
  };

  const getPrintUsed = () => {
    const today = dayjs().startOf("day");
    const dateStoredRaw = localStorage.getItem("print-date");
    const dateStored = dateStoredRaw
      ? dayjs(dateStoredRaw).startOf("day")
      : null;

    let count = 0;

    if (today.isAfter(dateStored, "day")) {
      localStorage.setItem("print-date", today.toISOString());
      localStorage.setItem("print-used", 0);
      return 0;
    }

    let printUsed = localStorage.getItem("print-used");
    if (printUsed) count = parseInt(printUsed, 10) || 0;
    return count;
  };

  const setPrintUsed = () => {
    if (planType !== "FREE") return;
    let printUsed = getPrintUsed();
    localStorage.setItem("print-used", printUsed + 1);
  };

  const canPrint = () => {
    if (planType !== "FREE") return true;

    const printUsed = getPrintUsed();
    const today = dayjs().startOf("day");

    const dateStoredRaw = localStorage.getItem("print-date");
    const dateStored = dateStoredRaw
      ? dayjs(dateStoredRaw).startOf("day")
      : null;

    if (!dateStored || printUsed === 0) {
      localStorage.setItem("print-date", today.toISOString());
      return true;
    }

    if (dateStored && dateStored.isSame(today, "day")) {
      return printUsed < printLimit;
    }

    if (today.isAfter(dateStored, "day")) {
      localStorage.setItem("print-date", today.toISOString());
      localStorage.setItem("print-used", 0);
      return true;
    }

    return false;
  };

  return {
    planType,
    printLimit,
    whatsappLimit,
    subscriptionExpire,
    registerAt,
    getWhatsappUsed,
    setWhatsappUsed,
    setPrintUsed,
    getPrintUsed,
    canPrint,
    canSendWhatsapp,
    init,
  };
};

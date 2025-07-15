import React, { useEffect, useState } from "react";
import { send } from "../control/renderer";
import { useAppStore } from "../libs/appStore";

const useInitHeaderImage = () => {
  const [success, setSuccess] = useState(true);
  const { user } = useAppStore();

  const fetchHeader = async () => {
    try {
      const response = await fetch("http://localhost:3009/head.png");
      if (response.status === 200) {
        setSuccess(true);
      } else {
        setSuccess(false);
      }
    } catch (e) {
      setSuccess(false);
    }
  };

  useEffect(() => {
    fetchHeader();
  }, []);

  const generateHeader = (user, cb) => {
    if (user) {
      send({
        query: "initHeadImage2",
        labName: user?.labName || "...",
        phone: user?.phone || "...",
        address: user?.address || "...",
      }).then(() => {
        cb();
      });
    }
  };

  useEffect(() => {
    if (!success)
      generateHeader(user, () => {
        console.log("Generated Image...");
      });
  }, [success, user]);

  return { generateHeader };
};

export default useInitHeaderImage;

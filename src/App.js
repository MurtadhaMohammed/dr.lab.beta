import React, { useEffect } from "react";
import { ConfigProvider, message } from "antd";
import { Routes, Route } from "react-router-dom";
import dayjs from "dayjs";
import MainHeader from "./components/Header";
import MainContainer from "./components/Container";
import PatientsScreen from "./screens/PatientsScreen";
import TestsScreen from "./screens/TestsScreen";
import GroupsScreen from "./screens/GroupsScreen";
import HomeScreen from "./screens/HomeScreen";
import ReportsScreen from "./screens/ReportsScreen";
import LoginScreen from "./screens/LoginScreen";
import SettingsScreen from "./screens/SettingScreen";
import MainContainerV2 from "./components/ContainerV2";
import { useAppStore } from "./appStore";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import TiteBar from "./components/TitleBar/titleBar";

const { ipcRenderer } = window.require("electron");

function App() {
  const { isLogin, setIsLogin, setUser } = useAppStore();

  useEffect(() => {
    ipcRenderer.on("hello", () => {
      console.log("HEEELLLL");
    });
    ipcRenderer.on("update-available", () => {
      console.log("update-available");
    });
    ipcRenderer.on("update-downloaded", () => {
      console.log("update-downloaded");
    });
    ipcRenderer.on("update-err", (err) => {
      console.log("update-err ", err);
    });
  }, []);

  useEffect(() => {
    if (isLogin) {
      let userString = localStorage.getItem("lab-user");
      if (userString) setUser(JSON.parse(userString));
    }
  }, [isLogin, setUser]);

  const checkExpire = () => {
    let exp = localStorage.getItem("lab-exp");
    let user = localStorage.getItem("lab-user");
    let createdAt = localStorage.getItem("lab-created");
    if (!exp || !createdAt || !user) {
      setIsLogin(false);
    } else {
      let isExp = dayjs().isAfter(dayjs(createdAt).add(exp, "d"));
      if (isExp) {
        message.error("Serial Expired!");
        setIsLogin(false);
      } else {
        setIsLogin(true);
      }
    }
  };

  useEffect(() => {
    checkExpire();
  }, [isLogin]);

  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <ConfigProvider
      direction={direction}
      theme={{
        token: {
          colorPrimary: "#0000ff",
          colorError: "#eb2f96",
          colorLink: "#0000ff",
          borderRadius: 8,
        },
      }}
    >
      <TiteBar/>
      {!isLogin && <LoginScreen />}
      {isLogin && (
        <>
          {/* <MainHeader /> */}
          <MainContainerV2>
            <Routes>
              <Route exact path="/" element={<HomeScreen />} />
              <Route path="/patients" element={<PatientsScreen />} />
              <Route path="/tests" element={<TestsScreen />} />
              <Route path="/groups" element={<GroupsScreen />} />
              <Route path="/reports" element={<ReportsScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </MainContainerV2>
        </>
      )}
    </ConfigProvider>
  );
}

export default App;

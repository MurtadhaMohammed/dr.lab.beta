import React, { useEffect, useState } from "react";
import { ConfigProvider, message } from "antd";
import { Routes, Route } from "react-router-dom";
import i18n from "./i18n";
import MainContainerV2 from "./components/ContainerV2";
import PatientsScreen from "./screens/PatientsScreen";
import TestsScreen from "./screens/TestsScreen";
import GroupsScreen from "./screens/GroupsScreen";
import HomeScreen from "./screens/HomeScreen";
import ReportsScreen from "./screens/ReportsScreen";
import LoginScreen from "./screens/LoginScreen";
import SettingsScreen from "./screens/SettingScreen";
import TitleBar from "./components/TitleBar/titleBar";
import useLogin from "./hooks/useLogin";
import { useAppStore } from "./libs/appStore";
import useLang from "./hooks/useLang";
import useInitHeaderImage from "./hooks/useInitHeaderImage";


const { ipcRenderer } = window.require("electron");

function App() {
  const { isLogin } = useAppStore();
  const { lang } = useLang();
  const { isOnline, setIsOnline } = useAppStore();

  useInitHeaderImage();
  useLogin();

  useEffect(() => {
    // ipcRenderer.on("hello", () => {
    //   console.log("HEEELLLL");
    // });
    ipcRenderer.on("update-available", () => {
      console.log("update-available");
    });
    ipcRenderer.on("update-downloaded", () => {
      console.log("update-downloaded");
    });
    ipcRenderer.on("update-err", (err) => {
      console.log("update-err ", err);
    });

    // Handle online and offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const online = window.addEventListener("online", handleOnline);
    const offline = window.addEventListener("offline", handleOffline);

    return () => {
      online, offline;
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      message.error("No internet connection. Please check your connection.");
    }
  }, [isOnline]);

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
      <TitleBar />
      {!isLogin && <LoginScreen />}
      {isLogin && (
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
      )}
    </ConfigProvider>
  );
}

export default App;

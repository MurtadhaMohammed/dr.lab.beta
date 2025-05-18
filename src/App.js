import React, { useEffect } from "react";
import { ConfigProvider, theme } from "antd";
import { Routes, Route } from "react-router-dom";
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
import useInitHeaderImage from "./hooks/useInitHeaderImage";
import OTPScreen from "./screens/OTPScreen/Index";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "./hooks/useAppThem";
import DoctorsScreen from "./screens/DoctorsScreen";
const { darkAlgorithm, defaultAlgorithm } = theme;

const { ipcRenderer } = window.require("electron");

function App() {
  const { isLogin, setIsOnline } = useAppStore();
  const { appTheme, appColors } = useAppTheme();
  const { i18n } = useTranslation();

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

  console.log(appTheme)

  return (
    <ConfigProvider
      key={appTheme}
      direction={i18n.language === "en" ? "ltr" : "rtl"}
      theme={{
        algorithm: appTheme === "dark" ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: appColors?.colorPrimary,
          colorError: appColors?.colorError,
          colorLink: appColors?.colorLink,
          borderRadius: 8,
        },
      }}
    >
      <TitleBar />
      {!isLogin && !localStorage.getItem("verification_phone") && (
        <LoginScreen />
      )}
      {!isLogin && localStorage.getItem("verification_phone") && <OTPScreen />}
      {isLogin && (
        <MainContainerV2>
          <Routes>
            <Route exact path="/" element={<HomeScreen />} />
            <Route path="/patients" element={<PatientsScreen />} />
            <Route path="/tests" element={<TestsScreen />} />
            <Route path="/groups" element={<GroupsScreen />} />
            <Route path="/reports" element={<ReportsScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/doctors" element={<DoctorsScreen />} />
          </Routes>
        </MainContainerV2>
      )}
    </ConfigProvider>
  );
}

export default App;

import React, { useEffect } from "react";
import { ConfigProvider, theme, message } from "antd";
import { Routes, Route, useLocation } from "react-router-dom";
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
// import useInitHeaderImage from "./hooks/useInitHeaderImage";
import OTPScreen from "./screens/OTPScreen/Index";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "./hooks/useAppThem";
import DoctorsScreen from "./screens/DoctorsScreen";
import { usePlan } from "./hooks/usePlan";
import VisitsScreen from "./screens/VisitsScreen";
const { darkAlgorithm, defaultAlgorithm } = theme;

const { ipcRenderer } = window.require("electron");

function App() {
  const { isLogin, setIsOnline, setUpdateInfo, setUpdateStatus } = useAppStore();
  const { appTheme, appColors } = useAppTheme();
  const { initUser } = usePlan();
  const { i18n, t } = useTranslation();
  const location = useLocation();
    

  useLogin();

  useEffect(() => {
    ipcRenderer.on("checking-for-update", () => {
      console.log("Checking for updates...");
      setUpdateStatus("checking");
    });

    ipcRenderer.on("update-available", (event, info) => {
      console.log("Update available:", info);
      setUpdateInfo(info);
      setUpdateStatus("available");
      message.info({
        content: `New version ${info.version} is available!`,
        duration: 5,
      });
    });

    ipcRenderer.on("update-not-available", (event, info) => {
      console.log("No update available");
      setUpdateStatus("not-available");
    });

    ipcRenderer.on("download-progress", (event, progress) => {
      console.log("Download progress:", progress.percent);
      setUpdateStatus("downloading");
      setUpdateInfo({ downloadProgress: progress.percent });
    });

    ipcRenderer.on("update-downloaded", () => {
      console.log("Update downloaded");
      setUpdateStatus("downloaded");
      message.success({
        content: "Update downloaded! Restart to install.",
        duration: 0,
      });
    });

    ipcRenderer.on("update-err", (event, err) => {
      console.log("Update error:", err);
      setUpdateStatus("error");
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
    if (isLogin) initUser();
  }, [isLogin, location]);

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
            <Route exact path="/visits" element={<VisitsScreen />} />
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

import MainHeader from "./components/Header";
import MainContainer from "./components/Container";
import PatientsScreen from "./screens/PatientsScreen";
import TestsScreen from "./screens/TestsScreen";
import GroupsScreen from "./screens/GroupsScreen";
import { ConfigProvider } from "antd";
import HomeScreen from "./screens/HomeScreen";
import { Routes, Route } from "react-router-dom";
import ReportsScreen from "./screens/ReportsScreen";
import LoginScreen from "./screens/LoginScreen";
import { useAppStore } from "./appStore";
import { useEffect } from "react";
import dayjs from "dayjs";

function App() {
  const { isLogin, setIsLogin } = useAppStore();

  const checkExpire = () => {
    let exp = localStorage.getItem("lab-exp");
    let createdAt = localStorage.getItem("lab-created");
    if (!exp || !createdAt) setIsLogin(false);
    else {
      let isExp = dayjs().isAfter(dayjs(createdAt).add(exp, "d"));
      if (isExp) setIsLogin(false);
      else setIsLogin(true);
    }
  };

  useEffect(() => {
    checkExpire();
  }, [isLogin]);

  return (
    <ConfigProvider
      theme={{
        token: {
          // colorPrimary: "#5b8c00",
          borderRadius: 10,
        },
      }}
    >
      {!isLogin && <LoginScreen />}
      {isLogin && (
        <>
          <MainHeader />
          <MainContainer>
            <Routes>
              <Route exact path="/" element={<HomeScreen />} />
              <Route path="/patients" element={<PatientsScreen />} />
              <Route path="/tests" element={<TestsScreen />} />
              <Route path="/groups" element={<GroupsScreen />} />
              <Route path="/reports" element={<ReportsScreen />} />
            </Routes>
          </MainContainer>
        </>
      )}
    </ConfigProvider>
  );
}

export default App;

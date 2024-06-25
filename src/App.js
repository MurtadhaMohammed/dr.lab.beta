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
import { send } from "./control/renderer";

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
    send({
      query: "get-patients",
      skip: 0,
      limit: 10
    }).then(resp => {
      if (resp.success) {
        console.log("Patients data:", resp.data);
      } else {
        console.error("Error fetching patients:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });


    send({
      query: "add-patient",
      data: {
        name: "John Doe",
        gender: "male",
        email: "john.doe@example.com",
        phone: "0712345678",
        birth: "Tue, 20 Jun 2000 19:13:10 GMT",
      }
    }).then(resp => {
      if (resp.success) {
        console.log("Patient added with ID:", resp.id);
      } else {
        console.error("Error adding patient:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });

    send({
      query: "deletePatient",
      id: 1
    }).then(resp => {
      if (resp.success) {
        console.log("Number of deleted rows:", resp.changes);
      } else {
        console.error("Error deleting patient:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });
  }, []);



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

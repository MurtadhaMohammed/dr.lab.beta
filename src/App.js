import MainHeader from "./components/Header";
import MainContainer from "./components/Container";
import PatientsScreen from "./screens/PatientsScreen";
import TestsScreen from "./screens/TestsScreen";
import GroupsScreen from "./screens/GroupsScreen";
import { ConfigProvider, message } from "antd";
import HomeScreen from "./screens/HomeScreen";
import { Routes, Route } from "react-router-dom";
import ReportsScreen from "./screens/ReportsScreen";
import LoginScreen from "./screens/LoginScreen";
import { useAppStore } from "./appStore";
import { useEffect } from "react";
import dayjs from "dayjs";
// import { send } from "./control/renderer";
// import { title } from "process";
import SettingsScreen from "./screens/SettingScreen";

function App() {
  const { isLogin, setIsLogin, setUser } = useAppStore();

  useEffect(() => {
    let userString = localStorage.getItem("lab-user");
    if (userString) setUser(JSON.parse(userString));
  }, []);

  const checkExpire = () => {
    let exp = localStorage.getItem("lab-exp");
    let user = localStorage.getItem("lab-user");
    let createdAt = localStorage.getItem("lab-created");
    if (!exp || !createdAt || !user) setIsLogin(false);
    else {
      let isExp = dayjs().isAfter(dayjs(createdAt).add(exp, "d"));
      if (isExp) {
        message.error("Searil Expired!");
        setIsLogin(false);
      } else setIsLogin(true);
    }
  };

  useEffect(() => {
    // send({
    //   query: "getPatients",
    //   q: "testUpdate",
    //   skip: 0,
    //   limit: 10
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Patients data:", resp.data);
    //   } else {
    //     console.error("Error fetching patients:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "addPatient",
    //   data: {
    //     name: "John Doe",
    //     gender: "male",
    //     email: "john.doe@example.com",
    //     phone: "0712345678",
    //     birth: "Tue, 20 Jun 2000 19:13:10 GMT",
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Patient added with ID:", resp.id);
    //   } else {
    //     console.error("Error adding patient:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "deletePatient",
    //   id: 1
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Number of deleted rows:", resp.data);
    //   } else {
    //     console.error("Error deleting patient:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "updatePatient",
    //   id: 1, // Replace with the actual patient ID
    //   data: {
    //     name: "testUpdate", // Fields to be updated
    //     gender: "female",
    //     email: "tt.doe@example.com",
    //     phone: "4442345679",
    //     birth: "Wed, 21 Jun 2000 19:13:10 GMT",
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Patient updated:", resp.data);
    //   } else {
    //     console.error("Error updating patient:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "addTest",
    //   data: {
    //     id: 1,
    //     name: "testByTabarak",
    //     price: 22,
    //     normal: null,
    //     isSelecte: true,
    //     options: ["positive", "negative"],
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Test added with ID:", resp.id);
    //   } else {
    //     console.error("Error adding test:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "deleteTest",
    //   id: 6
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Success deleting test");
    //   } else {
    //     console.error("Error deleting Test:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "editTest",
    //   id: 3,
    //   data: {
    //     name: "Updated Test Name",
    //     price: 30,
    //     normal: "Updated Normal Range",
    //     result: "Updated Result",
    //     options: null,
    //     isSelect: true
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Test updated successfully");
    //   } else {
    //     console.error("Error updating test:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "getTests",
    //   q: "addTest",
    //   skip: 0,
    //   limit: 10
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Tests get successfully:", resp.data);
    //   } else {
    //     console.error("Error get tests:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "addPackage",
    //   data: {
    //     title: "ADDPackage",
    //     customePrice: 200,
    //     testIDs: [1, 2, 3]
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Package added with ID:", resp.data);
    //   } else {
    //     console.error("Error adding package:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "deletePackage",
    //   id: 1
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Success deletePackage");
    //   } else {
    //     console.error("Error deletePackage:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "editPackage",
    //   data: {
    //     id: 3,
    //     title: "UpdatedPackage",
    //     customePrice: 444,
    //     testIDs: [2, 3]
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Package updated successfully");
    //   } else {
    //     console.error("Error updating package:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "getPackages",
    //   data: {
    //     q: "ADDPackage",
    //     skip: 0,
    //     limit: 10
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Packages retrieved successfully:", resp.data);
    //   } else {
    //     console.error("Error retrieving packages:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "addVisit",
    //   data: {
    //     patientID: 3,
    //     status: "PENDING",
    //     testType: ["CUSTOME test", "PACKAGE test"],
    //     discount: 10
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Visit added with ID:", resp.id);
    //   } else {
    //     console.error("Error adding visit:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    //  send({
    //       query: "deleteVisit",
    //       id: 20
    //     }).then(resp => {
    //       if (resp.success) {
    //         console.log("Success deleteVisit");
    //       } else {
    //         console.error("Error deleteVisit:", resp.error);
    //       }
    //     }).catch(err => {
    //       console.error("Error in IPC communication:", err);
    //     });
    // send({
    //   query: "getVisits",
    //   data: {
    //     q: "John Doe",
    //     skip: 0,
    //     limit: 10
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Visits retrieved successfully:", resp.data);
    //   } else {
    //     console.error("Error retrieving visits:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
    // send({
    //   query: "updateVisit",
    //   id: 3,
    //   data: {
    //     patientID: 1,
    //     status: "COMPLETED",
    //     testType: "Package",
    //     tests: "UPdate",
    //     discount: 10
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Visit updated successfully");
    //   } else {
    //     console.error("Error updating visit:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });
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
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </MainContainer>
        </>
      )}
    </ConfigProvider>
  );
}

export default App;

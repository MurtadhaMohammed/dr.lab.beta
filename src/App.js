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
import { title } from "process";

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
    //   id: 2, // Replace with the actual patient ID
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
    //   query: "searchPatient",
    //   name:"testUpdate"
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Search results:", resp.data);
    //   } else {
    //     console.error("Error searching patient:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });

    // send({
    //   query: "addTest",
    //   data: {
    //     id: 1,
    //     name: "addTest",
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
    //   id: 1
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
    //     isSelected: true
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
    //     patientID: 1,
    //     status: "PENDING",
    //     testType:  ["custom test", "package test"],
    //     tests: ["Test A", "Test B"],
    //     discount: 10
    //   }
    // }).then(resp => {
    //   if (resp.success) {
    //     console.log("Visit added with ID:", resp.data);
    //   } else {
    //     console.error("Error adding visit:", resp.error);
    //   }
    // }).catch(err => {
    //   console.error("Error in IPC communication:", err);
    // });


    //  send({
    //       query: "deleteVisit",
    //       id: 2
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

    send({
      query: "updateVisit",
      id: 3,
      data: {
        patientID: 1,
        status: "COMPLETED",
        testType: "Package",
        tests: "UPdate",
        discount: 10
      }
    }).then(resp => {
      if (resp.success) {
        console.log("Visit updated successfully");
      } else {
        console.error("Error updating visit:", resp.error);
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

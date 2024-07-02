import { Button, Modal, Space, message } from "antd";
import { useAppStore, useHomeStore } from "../../../appStore";
import "./style.css";
import PureSteps from "../../Global/Steps";
import { useState } from "react";
import { send } from "../../../control/renderer";
import TestForm from "./testForm";
import PatientForm from "./patientForm";

const testLabel = {
  CUSTOME: "Custome",
  PACKAGE: "Package",
};

export const PureModal = () => {
  const { setIsReload, isReload } = useAppStore();
  const {
    isModal,
    setIsModal,
    testType,
    name,
    birth,
    gender,
    discount,
    phone,
    email,
    id,
    setReset,
    tests,
    status,
    createdAt,
    uID,
  } = useHomeStore();
  const [step, setStep] = useState(0);

  const handleSubmit = () => {
    let data = {
      patient: {
        id: uID,
        name,
        gender,
        email,
        phone,
        birth: birth.toString(),
        updatedAt: Date.now(),
      },
      status,
      testType,
      tests,
      discount,
      updatedAt: Date.now(),
    };

    if (id) {
      send({
        query: "updateVisit",
        id,
        data: { ...data }
      }).then(resp => {
        if (resp.success) {
          message.success("Visit updated successfully");
          console.log("updateVisit response:", resp);
          send({
            query: "updatePatient",
            id,
            data: { ...data.patient, createdAt }
          }).then(resp => {
            if (resp.success) {
              message.success("Patient updated successfully");
              console.log("updatePatient response:", resp);
              setReset();
              setIsModal(false);
              setIsReload(!isReload);
              setStep(0);
            } else {
              message.error("Error updating patient");
            }
          });
        } else {
          message.error("Error updating visit");
        }
      }).catch(err => {
        console.error("Error in IPC communication:", err);
      });
    } else {
      getPatien((pObj) => {
        if (pObj) {
          send({
            query: "updatePatient",
            id,
            data: { ...data.patient, createdAt: pObj.createdAt }
          }).then(resp => {
            console.log("updatePatient response:", resp);
            if (resp.success) {
              send({
                query: "addVisit",
                data: { ...data, patientID: resp.data.id, createdAt: Date.now() },
              }).then(resp => {
                if (resp.success) {
                  console.log("addVisit response:", resp);
                  message.success("Visit added successfully");
                  setReset();
                  setIsModal(false);
                  setIsReload(!isReload);
                  setStep(0);
                } else {
                  message.error("Error adding visit");
                }
              }).catch(err => {
                console.error("Error in IPC communication:", err);
              });
            } else {
              message.error("Error updating patient");
            }
          });
        } else {
          send({
            query: "addPatient",
            data: { ...data.patient, createdAt: Date.now() },
          }).then(resp => {
            if (resp.success) {
              console.log("addPatient response:", resp);
              send({
                query: "addVisit",
                data: { ...data, patientID: resp.id, createdAt: Date.now() },
              }).then(resp => {
                console.log("addVisit response:", resp);
                if (resp.success) {
                  message.success("Visit added successfully");
                  setReset();
                  setIsModal(false);
                  setIsReload(!isReload);
                  setStep(0);
                } else {
                  message.error("Error adding visit");
                }
              }).catch(err => {
                console.error("Error in IPC communication:", err);
              });
            } else {
              message.error("Error adding patient");
            }
          }).catch(err => {
            console.error("Error in IPC communication:", err);
          });
        }
      });
    }
  };

  const getPatien = (cb) => {
    send({
      query: "getPatients",
      q: "",
    }).then(resp => {
      if (resp.success) {
        const patient = resp.data.find(p => p.id === id);
        cb(patient);
      } else {
        console.error("Error fetching patients:", resp.error);
        cb();
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
      cb();
    });
  };

  const pageStep = [<TestForm />, <PatientForm />];

  const actionStep = [
    <Space>
      <Button
        onClick={() => {
          setIsModal(false);
        }}
      >
        Close
      </Button>
      <Button disabled={!tests || tests.length === 0} onClick={() => setStep(1)}>
        Next
      </Button>
    </Space>,
    <Space>
      <Button onClick={() => setStep(0)}>Previous</Button>
      <Button
        disabled={!name || !gender || !birth || !tests || tests.length === 0}
        onClick={handleSubmit}
        type="primary"
      >
        Finish
      </Button>
    </Space>,
  ];

  return (
    <Modal
      title={`${id ? "Edit" : "Add"} ${testLabel[testType]} Test for Patient`}
      open={isModal}
      width={400}
      onOk={() => {
        setIsModal(false);
      }}
      onCancel={() => {
        setIsModal(false);
      }}
      footer={
        <div className="app-flex-space">
          <PureSteps length={2} activeIndex={step} />
          {actionStep[step]}
        </div>
      }
      centered
      destroyOnClose
    >
      <div className="create-test-modal">{pageStep[step]}</div>
    </Modal>
  );
};
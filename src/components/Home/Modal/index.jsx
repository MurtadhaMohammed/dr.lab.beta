import { Button, Modal, Space, message } from "antd";
import { useAppStore, useHomeStore } from "../../../appStore";
import "./style.css";
import PureSteps from "../../Global/Steps";
import { useState } from "react";
import { send } from "../../../control/renderer";
import TestForm from "./testForm";
import PatientForm from "./patientForm";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";


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
    patientID,
  } = useHomeStore();
  const [step, setStep] = useState(0);

  const { t } = useTranslation();
  // const testLabel = {
  //   [t("CUSTOME")]: "Custome",
  //   [t("PACKAGE")]: "Package",
  // };

  const testLabel = {
    CUSTOME: t("Custome"),
    PACKAGE: t("Packages"),
  };

  const handleSubmit = () => {
    let data = {
      patient: {
        // id: patientID,
        name,
        gender,
        email,
        phone,
        birth: birth.toString(),
      },
      status,
      testType,
      tests,
      discount,
    };

    if (id) {
      send({
        query: "updateVisit",
        id,
        data: { ...data },
      })
        .then((resp) => {
          if (resp.success) {
            message.success("Visit updated successfully");
            console.log("updateVisit response:", resp);
            send({
              query: "updatePatient",
              id: patientID,
              data: { ...data.patient },
            }).then((resp) => {
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
        })
        .catch((err) => {
          console.error("Error in IPC communication:", err);
        });
    } else {
      if (patientID) {
        send({
          query: "updatePatient",
          id: patientID,
          data: { ...data.patient },
        }).then((resp) => {
          console.log("updatePatient response:", resp);
          if (resp.success) {
            send({
              query: "addVisit",
              data: {
                ...data,
                patientID,
              },
            })
              .then((resp) => {
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
              })
              .catch((err) => {
                console.error("Error in IPC communication:", err);
              });
          } else {
            message.error("Error updating patient");
          }
        });
      } else {
        send({
          query: "addPatient",
          data: { ...data.patient },
        })
          .then((resp) => {
            if (resp.success) {
              console.log("addPatient response:", resp);
              send({
                query: "addVisit",
                data: { ...data, patientID: resp.id },
              })
                .then((resp) => {
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
                })
                .catch((err) => {
                  console.error("Error in IPC communication:", err);
                });
            } else {
              message.error("Error adding patient");
            }
          })
          .catch((err) => {
            console.error("Error in IPC communication:", err);
          });
      }
    }
  };

  const pageStep = [<TestForm />, <PatientForm />];

  const actionStep = [
    <Space>
      <Button
        onClick={() => {
          setIsModal(false);
        }}
      >
        {t("Close")}
      </Button>
      <Button
        disabled={!tests || tests.length === 0}
        onClick={() => setStep(1)}
      >
        {t("Next")}
      </Button>
    </Space>,
    <Space>
      <Button onClick={() => setStep(0)}>{t("Previous")}</Button>
      <Button
        disabled={!name || !gender || !birth || !tests || tests.length === 0}
        onClick={handleSubmit}
        type="primary"
      >
       {t("Finish")}
      </Button>
    </Space>,
  ];

  return (
    <Modal
      title={`${id ? t("Edit") : t("Add")} ${testLabel[testType]} ${t("TestForPatient")}`}
      open={isModal}
      width={400}
      onOk={() => {
        setIsModal(false);
      }}
      onCancel={() => {
        setIsModal(false);
        setReset();
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

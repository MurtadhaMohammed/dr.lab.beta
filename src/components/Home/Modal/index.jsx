import { Button, Modal, Space, Steps, message } from "antd";
import { useAppStore, useHomeStore } from "../../../libs/appStore";
import "./style.css";
import PureSteps from "../../Global/Steps";
import { useState } from "react";
import { send } from "../../../control/renderer";
import TestForm from "./testForm";
import PatientForm from "./patientForm";
import { useTranslation } from "react-i18next";
import DoctorForm from "./doctorForm";

export const PureModal = () => {
  const { setIsReload, isReload } = useAppStore();
  const {
    isModal,
    setIsModal,
    testType,
    discount,
    id,
    tests,
    setTests,
    status,
    patientRow,
    setPatientRow,
    setDoctorRow,
    doctorRow,
  } = useHomeStore();
  const [step, setStep] = useState(0);

  const { t, i18n } = useTranslation();
  // const testLabel = {
  //   [t("CUSTOME")]: "Custome",
  //   [t("PACKAGE")]: "Package",
  // };

  const testLabel = {
    CUSTOME: t("Custome"),
    PACKAGE: t("Packages"),
  };

  const isPatientValid =
    patientRow?.name && patientRow?.gender && patientRow?.birth && patientRow?.phone;

  const isDoctorValid =
    (doctorRow &&
      typeof doctorRow === "object" &&
      Object.keys(doctorRow).length === 0) ||
    (doctorRow?.name != null && doctorRow?.name != "");

  const updateVisit = async (doctorID) => {
    try {
      const resp = await send({
        query: "updateVisit",
        id,
        data: { status, testType, tests, discount, doctorID },
      });
      return resp;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const addVisit = async (patientID, doctorID) => {
    try {
      const resp = await send({
        query: "addVisit",
        data: { status, testType, tests, discount, patientID, doctorID },
      });
      return resp;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const updatePatient = async () => {
    try {
      const resp = await send({
        query: "updatePatient",
        id: patientRow?.id,
        data: patientRow,
      });
      return resp;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const addPatient = async () => {
    try {
      const resp = await send({
        query: "addPatient",
        data: patientRow,
      });
      return resp;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const addDoctor = async () => {
    try {
      const resp = await send({
        query: "addDoctor",
        data: doctorRow,
      });
      return resp;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const updateDoctor = async () => {
    try {
      const resp = await send({
        query: "updateDoctor",
        id: doctorRow?.id,
        data: doctorRow,
      });
      return resp;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const handleSubmit = async () => {
    patientRow.birth = patientRow?.birth?.toString();
    let doctorID;
    let patientID;
    if (doctorRow?.id) {
      const doctorResp = await updateDoctor();
      if (!doctorResp || !doctorResp.success) {
        message.error(t("Errorupdatingvisit"));
        return;
      }
      doctorID = doctorRow?.id;
    } else if (doctorRow?.name) {
      const doctorResp = await addDoctor();
      if (!doctorResp || !doctorResp.success) {
        message.error(t("Errorupdatingvisit"));
        return;
      }
      doctorID = doctorResp?.id;
    }

    if (patientRow?.id) {
      let patientResp = await updatePatient();
      if (!patientResp || !patientResp.success) {
        message.error(t("Errorupdatingvisit"));
        return;
      }
      patientID = patientRow?.id;
    } else if (isPatientValid) {
      const patientResp = await addPatient();
      if (!patientResp || !patientResp.success) {
        message.error(t("Errorupdatingvisit"));
        return;
      }
      patientID = patientResp?.id;
    }

    if (id) {
      let visitResp = await updateVisit(doctorID);
      if (!visitResp || !visitResp.success) {
        message.error(t("Errorupdatingvisit"));
        return;
      }

      message.success(t("Visitupdatedsuccessfully"));
      resetSate();
    } else {
      let visitResp = await addVisit(patientID, doctorID);
      if (!visitResp || !visitResp.success) {
        message.error(t("Erroraddingvisit"));
        return;
      }

      message.success(t("Visitaddedsuccessfully"));
      resetSate();
    }
  };

  const resetSate = () => {
    setPatientRow();
    setDoctorRow();
    setIsModal(false);
    setIsReload(!isReload);
    setTests([])
    setStep(0);
  };

  // const handleSubmit = () => {
  //   let data = {
  //     patient: {
  //       name: patientRow?.name,
  //       gender: patientRow?.gender,
  //       email: patientRow?.email,
  //       phone: patientRow?.phone,
  //       birth: patientRow?.birth?.toString(),
  //     },
  //     doctor: {
  //       name: doctorRow?.name,
  //       gender: doctorRow?.gender,
  //       email: doctorRow?.email,
  //       phone: doctorRow?.phone,
  //       address: doctorRow?.address,
  //       type: doctorRow?.type,
  //     },
  //     status,
  //     testType,
  //     tests,
  //     discount,
  //   };

  //   if (id) {
  //     send({
  //       query: "updateVisit",
  //       id,
  //       data: { ...data },
  //     })
  //       .then((resp) => {
  //         if (resp.success) {
  //           message.success(t("Visitupdatedsuccessfully"));
  //           send({
  //             query: "updatePatient",
  //             id: patientRow?.id,
  //             data: { ...data.patient },
  //           }).then((resp) => {
  //             if (resp.success) {
  //               // message.success(t("Patientupdatedsuccess"));
  //               setPatientRow();
  //               setDoctorRow();
  //               setIsModal(false);
  //               setIsReload(!isReload);
  //               setStep(0);
  //             } else {
  //               message.error(t("Errorupdatingpatient"));
  //             }
  //           });
  //         } else {
  //           message.error(t("Errorupdatingvisit"));
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Error in IPC communication:", err);
  //       });
  //   } else {
  //     if (patientRow?.id) {
  //       send({
  //         query: "updatePatient",
  //         id: patientRow?.id,
  //         data: { ...data.patient },
  //       }).then((resp) => {
  //         if (resp.success) {
  //           send({
  //             query: "addVisit",
  //             data: {
  //               ...data,
  //               patientID: patientRow?.id,
  //             },
  //           })
  //             .then((resp) => {
  //               if (resp.success) {
  //                 message.success(t("Visitaddedsuccessfully"));
  //                 setPatientRow();
  //                 setDoctorRow();
  //                 setIsModal(false);
  //                 setIsReload(!isReload);
  //                 setStep(0);
  //               } else {
  //                 message.error(t("Erroraddingvisit"));
  //               }
  //             })
  //             .catch((err) => {
  //               console.error("Error in IPC communication:", err);
  //             });
  //         } else {
  //           message.error(t("Errorupdatingpatient"));
  //         }
  //       });
  //     } else {
  //       send({
  //         query: "addPatient",
  //         data: { ...data.patient },
  //       })
  //         .then((resp) => {
  //           if (resp.success) {
  //             send({
  //               query: "addVisit",
  //               data: { ...data, patientID: resp.id },
  //             })
  //               .then((resp) => {
  //                 if (resp.success) {
  //                   // message.success(t("Visitaddedsuccess"));
  //                   setReset();
  //                   setIsModal(false);
  //                   setIsReload(!isReload);
  //                   setStep(0);
  //                 } else {
  //                   message.error(t("Erroraddingvisit"));
  //                 }
  //               })
  //               .catch((err) => {
  //                 console.error("Error in IPC communication:", err);
  //               });
  //           } else {
  //             message.error(t("Erroraddingpatient"));
  //           }
  //         })
  //         .catch((err) => {
  //           console.error("Error in IPC communication:", err);
  //         });
  //     }
  //   }
  // };

  const pageStep = [<TestForm />, <PatientForm />, <DoctorForm />];

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
      <Button
        onClick={() => {
          setStep(0);
        }}
      >
        {t("Previous")}
      </Button>
      <Button disabled={!isPatientValid} onClick={() => setStep(2)}>
        {t("Next")}
      </Button>
    </Space>,
    <Space>
      <Button onClick={() => setStep(1)}>{t("Previous")}</Button>
      <Button
        disabled={
          !isDoctorValid || !isPatientValid || !tests || tests.length === 0
        }
        onClick={handleSubmit}
        type="primary"
      >
        {t("Finish")}
      </Button>
    </Space>,
  ];

  return (
    <Modal
      title={
        id
          ? t("Edit")
          : i18n.language === "ar"
          ? `${t("Add")} ${t("Test")} ${testLabel[testType]} ${t("forPatient")}`
          : `${t("Add")} ${testLabel[testType]} ${t("Test For Patient")}`
      }
      open={isModal}
      width={440}
      onOk={() => {
        setIsModal(false);
      }}
      onCancel={() => {
        setIsModal(false);
        setPatientRow({});
        setDoctorRow({});
        setStep(0);
      }}
      footer={
        <div className="app-flex-space">
          {/* <PureSteps length={3} activeIndex={step} /> */}
          {actionStep[step]}
        </div>
      }
      centered
      destroyOnClose
    >
      <Steps
        size="small"
        current={step}
        className="mt-[16px] mb-[26px]"
        items={[
          {
            title: `${t("AddTests")}`,
          },
          {
            title:  `${t("SelectPatient")}` ,
          },
          {
            title: `${t("SelectDoctor")}`,
          },
        ]}
      />
      <div className="create-test-modal">{pageStep[step]}</div>
    </Modal>
  );
};

import { Button, Modal, Space, Steps, message } from "antd";
import { useAppStore, useHomeStore } from "../../../libs/appStore";
import "./style.css";
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
    discount,
    id,
    tests,
    setTests,
    patientRow,
    setPatientRow,
    setDoctorRow,
    doctorRow,
  } = useHomeStore();
  const [step, setStep] = useState(0);

  const { t, i18n } = useTranslation();

  const isPatientValid =
    patientRow?.name &&
    patientRow?.gender &&
    patientRow?.birth

  const isDoctorValid =
    (doctorRow &&
      typeof doctorRow === "object" &&
      Object.keys(doctorRow).length === 0) ||
    (doctorRow?.name != null && doctorRow?.name != "");


  const updateVisit = async (patient_id, doctor_id) => {
    try {
      return await send({
        query: "updateVisitInfo",
        id,
        data: {
          tests: tests?.map((el) => ({ id: el.id })),
          discount_iqd: discount,
          patient_id,
          doctor_id: doctor_id || null,
        },
      });
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  };

  const addVisit = async (patient_id, doctor_id) => {
    try {
      const resp = await send({
        query: "addVisit",
        data: {
          tests: tests?.map((el) => ({ id: el.id })),
          discount_iqd: discount,
          patient_id,
          doctor_id: doctor_id || null,
          notes: "",
        },
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
      let visitResp = await updateVisit(patientID, doctorID);
      if (!visitResp || !visitResp.success) {
        message.error(t("Errorupdatingvisit"));
        return;
      }

      resetSate();
      message.success(t("Visitupdatedsuccessfully"));
    } else {
      let visitResp = await addVisit(patientID, doctorID);
      if (!visitResp || !visitResp.success) {
        message.error(t("Erroraddingvisit"));
        return;
      }

      resetSate();
      message.success(t("Visitaddedsuccessfully"));
    }
  };

  const resetSate = () => {
    setPatientRow({});
    setDoctorRow({});
    setIsModal(false);
    setIsReload(!isReload);
    setTests([]);
    setStep(0);
  };

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
          ? `${t("Add")} ${t("Test")} ${t("forPatient")}`
          : `${t("Add")} ${t("Test For Patient")}`
      }
      open={isModal}
      width={460}
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
            title: `${t("SelectPatient")}`,
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

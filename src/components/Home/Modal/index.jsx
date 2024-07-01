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

  // const handleSubmit = () => {
  //   let data = {
  //     patient: {
  //       uID,
  //       name,
  //       gender,
  //       email,
  //       phone,
  //       birth: birth.toString(),
  //       updatedAt: Date.now(),
  //     },
  //     status,
  //     testType,
  //     tests,
  //     discount,
  //     updatedAt: Date.now(),
  //   };

  // if (id) {
  //   send({
  //     doc: "visits",
  //     query: "update",
  //     condition: { _id: id },
  //     data: { ...data, createdAt },
  //   }).then(({ err, row }) => {
  //     if (err) message.error("Error !");
  //     else {
  //       send({
  //         doc: "patients",
  //         query: "update",
  //         condition: { uID: row?.patient?.uID },
  //         data: { ...data.patient, createdAt: row?.patient?.createdAt },
  //       }).then(({ err }) => {
  //         if (err) message.error("Error !");
  //         else {
  //           message.success("Save Succefful.");
  //           setReset();
  //           setIsModal(false);
  //           setIsReload(!isReload);
  //           setStep(0)
  //         }
  //       });
  //     }
  //   });
  // } else {
  //   getPatien((pObj) => {
  //     if (pObj) {
  //       send({
  //         doc: "patients",
  //         query: "update",
  //         condition: { uID },
  //         data: { ...data.patient, createdAt: pObj?.createdAt },
  //       }).then(({ err, row }) => {
  //         if (err) message.error("Error !");
  //         else {
  //           send({
  //             doc: "visits",
  //             query: "insert",
  //             data: { ...data, patient: row, createdAt: Date.now() },
  //           }).then(({ err }) => {
  //             if (err) message.error("Error !");
  //             else {
  //               message.success("Save Succefful.");
  //               setReset();
  //               setIsModal(false);
  //               setIsReload(!isReload);
  //               setStep(0)
  //             }
  //           });
  //         }
  //       });
  //     } else {
  //       send({
  //         doc: "patients",
  //         query: "insert",
  //         data: { ...data?.patient, createdAt: Date.now() },
  //       }).then(({ err, rows }) => {
  //         if (err) message.error("Error !");
  //         else {
  //           send({
  //             doc: "visits",
  //             query: "insert",
  //             data: { ...data, patient: rows, createdAt: Date.now() },
  //           }).then(({ err }) => {
  //             if (err) message.error("Error !");
  //             else {
  //               message.success("Save Succefful.");
  //               setReset();
  //               setIsModal(false);
  //               setIsReload(!isReload);
  //               setStep(0)
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  // }
  //};

  const handleSubmit = () => {
    let data = {
      patient: {
        id,
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
          console.log("Visit updated successfully", resp.data);
        }
        if (err) message.error("Error !");
        else {
          send({
            query: "updatePatient",
            id,
            data: { ...data.patient, createdAt: row?.patient?.createdAt }
          }).then(resp => {
            if (resp.success) {
              console.log("Patient updated:", resp.data);
              setReset();
              setIsModal(false);
              setIsReload(!isReload);
              setStep(0)
            } else {
              console.error("Error updating patient:", resp.error);
            }
          });;
        }
      });
    }
    else {
      getPatien((pObj) => {
        if (pObj) {
          send({
            query: "updatePatient",
            id,
            data: { ...data.patient, createdAt: pObj?.createdAt }
          }).then(resp => {
            if (resp.success) {
              console.log("Patient updated:", resp.data);
            } else
              if (err) message.error("Error !");

              else {
                send({
                  query: "addVisit",
                  data: { ...data, patient: row, createdAt: Date.now() },
                }).then(resp => {
                  if (resp.success) {
                    console.log("Visit added with ID:", resp.id);
                    setReset();
                    setIsModal(false);
                    setIsReload(!isReload);
                    setStep(0)
                  } else {
                    console.error("Error adding visit:", resp.error);
                  }
                }).catch(err => {
                  console.error("Error in IPC communication:", err);
                });
              }
          });

        } else {
          send({
            query: "addPatient",
            data: { ...data?.patient, createdAt: Date.now() },
          }).then(resp => {
            if (err) message.error("Error !");
            else {
              send({
                query: "addVisit",
                data: { ...data, patient: row, createdAt: Date.now() },
              }).then(resp => {
                if (resp.success) {
                  console.log("Visit added with ID:", resp.id);
                  setReset();
                  setIsModal(false);
                  setIsReload(!isReload);
                  setStep(0)
                } else {
                  console.error("Error adding visit:", resp.error);
                }
              }).catch(err => {
                console.error("Error in IPC communication:", err);
              });
            }
          });
        }
      });
    }

  }

  const getPatien = (cb) => {
    // send({
    //   doc: "patients",
    //   query: "find",
    //   search: { uID },
    // }).then(({ err, rows }) => {
    //   if (err) message.error("Error !");
    //   else if (rows?.length > 0) cb(rows[0]);
    //   else cb();
    // });

    send({
      query: "getPatients",
      q: "",
    }).then(resp => {
      if (resp.success) {
        console.log("Patients data:", resp.data);
      } else {
        console.error("Error fetching patients:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
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
      <Button disabled={!tests || tests.length == 0} onClick={() => setStep(1)}>
        Next
      </Button>
    </Space>,
    <Space>
      <Button onClick={() => setStep(0)}>Previue</Button>
      <Button
        disabled={!name || !gender || !birth || !tests || tests.length == 0}
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

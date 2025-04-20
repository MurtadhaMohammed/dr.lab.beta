import {
  Button,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import "./style.css";
import { useAppStore, useHomeStore } from "../../../libs/appStore";
import { send } from "../../../control/renderer";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export const parseTests = (record) => {
  let tests = [];
  if (record?.testType === "CUSTOME") {
    tests = [
      {
        title: "",
        rows: record.tests.map((el) => {
          return {
            name: el.name,
            result: el.result || "",
            normal: el.normal || "",
          };
        }),
      },
    ];
  } else if (record?.testType === "PACKAGE") {
    tests = record.tests.map((group) => {
      return {
        title: group.title,
        rows: group.tests.map((el) => {
          return {
            name: el.name,
            result: el.result || "",
            normal: el.normal || "",
          };
        }),
      };
    });
  }
  return tests;
};

export const ResultsModal = () => {
  const { isReload, setIsReload, setPrintFontSize, printFontSize } =
    useAppStore();
  const { setIsResultsModal, isResultsModal, record, setRecord, isBarcode, setIsBarcode } =
    useHomeStore();
  const { t } = useTranslation();
  const { isOnline } = useAppStore();

  useEffect(() => {
    if (isResultsModal && record) {
      console.log("Modal opened with the following options:");
      if (record?.testType === "CUSTOME") {
        record?.tests?.forEach((row) => {
          console.log(`Options for ${row?.name}:`, row?.options);
        });
      } else if (record?.testType === "PACKAGE") {
        record?.tests?.forEach((group) => {
          group?.tests?.forEach((row) => {
            console.log(`Options for ${row?.name}:`, row?.options);
          });
        });
      }
    }
  }, [isResultsModal, record]);

  const handleChange = (val, row) => {
    let newRecord = [];
    if (record?.testType === "CUSTOME") {
      newRecord = {
        ...record,
        tests: record?.tests.map((el) => {
          if (el.id === row?.id) return { ...el, result: val };
          return el;
        }),
      };
    } else if (record?.testType === "PACKAGE") {
      newRecord = {
        ...record,
        tests: record?.tests?.map((group) => {
          return {
            ...group,
            tests: group?.tests?.map((el) => {
              if (el.id === row?.id) return { ...el, result: val };
              return el;
            }),
          };
        }),
      };
    }
    setRecord(newRecord);
  };

  let printResults = (newTests) => {
    record.tests = newTests;
    let data = {
      patient: record.patient.name,
      age: dayjs().diff(dayjs(record.patient.birth), "y"),
      date: dayjs(record.createdAt).format("YYYY-MM-DD"),
      tests: parseTests(record),
      isHeader: true,
      fontSize: printFontSize,
    };
    send({
      query: "print",
      data,
    }).then(({ err, res }) => {
      console.log(err, res);
    });
  };

  let handleSubmit = () => {
    let data = { ...record, status: "COMPLETED", updatedAt: Date.now() };
    send({
      doc: "visits",
      query: "updateVisit",
      data: { ...data },
      id: record.id,
    }).then(({ err, newTests }) => {
      if (err) message.error("Error !");
      else {
        message.success(t("Saved Successfully"));

        try {
          if (isOnline && window.gtag) {
            window.gtag('event', 'click', {
              event_category: 'button',
              event_label: 'print-result-button',
              value: 1,
            });
          }
        } catch (e) {
          throw new Error(e.message);
        }

        setRecord(null);
        setIsResultsModal(false);
        setIsReload(!isReload);
        setTimeout(() => {
          printResults(newTests);
        }, 1000);
      }
    });
  };

  const handleBarcode = async (record) => {
    console.log(record, 'rrr');

    const resp = await send({
      query: "printParcode",
      data: {
        name: record?.patient?.name,
        id: record?.id,
      },
      selectedPrinter: localStorage.getItem('selectedPrinter'),
    });

    if (resp.success) {
      setIsReload(!isReload);
      setIsResultsModal(false);
      setIsBarcode(false);
      console.log(resp.success);
    }

    setIsBarcode(false);
    console.log(resp, 'ress');
  }

  let renderTable = {
    CUSTOME: (
      <div className="test-section">
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <div className="title">
            <Typography.Text type="secondary">
              {t("CustomTest")}
            </Typography.Text>
          </div>
          <div className="test-list">
            {record?.tests?.map((row) => {
              // Check and parse options if necessary
              if (typeof row.options === "string") {
                try {
                  row.options = JSON.parse(row.options);
                } catch (error) {
                  console.error("Error parsing options:", error);
                  row.options = [];
                }
              }

              console.log(`Rendering options for ${row?.name}:`, row?.options);

              return (
                <div className="test-item" key={row?.id}>
                  <p>
                    <b>{row?.name}</b>
                  </p>
                  {row?.isSelecte ? (
                    <Select
                      style={{ width: "100%" }}
                      value={row?.result}
                      onChange={(selctedVal) => handleChange(selctedVal, row)}
                      placeholder={t("ChooseResult")}
                    >
                      {Array.isArray(row?.options) && row.options.length > 0
                        ? row.options.map((option, i) => (
                          <Select.Option key={i} value={option}>
                            {option}
                          </Select.Option>
                        ))
                        : null}
                    </Select>
                  ) : (
                    <Input
                      value={row?.result}
                      onChange={(e) => handleChange(e.target.value, row)}
                      style={{ width: "100%" }}
                      placeholder={t("WriteResult")}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Space>
      </div>
    ),

    PACKAGE: record?.tests?.map((group, i) => (
      <div className="test-section" key={i}>
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <div className="title">
            <Typography.Text type="secondary"># {group.title}</Typography.Text>
          </div>
          <div className="test-list">
            {group?.tests?.map((row) => {
              // Check and parse options if necessary
              if (typeof row.options === "string") {
                try {
                  row.options = JSON.parse(row.options);
                } catch (error) {
                  console.error("Error parsing options:", error);
                  row.options = [];
                }
              }

              console.log(`Rendering options for ${row?.name}:`, row?.options);

              return (
                <div className="test-item" key={row?.id}>
                  <p>
                    <b>{row?.name}</b>
                  </p>
                  {row?.isSelecte ? (
                    <Select
                      style={{ width: "100%" }}
                      value={row?.result}
                      onChange={(selctedVal) => handleChange(selctedVal, row)}
                      placeholder={t("ChooseResult")}
                    >
                      {Array.isArray(row?.options) && row.options.length > 0
                        ? row.options.map((option, i) => (
                          <Select.Option key={i} value={option}>
                            {option}
                          </Select.Option>
                        ))
                        : null}
                    </Select>
                  ) : (
                    <Input
                      value={row?.result}
                      onChange={(e) => handleChange(e.target.value, row)}
                      style={{ width: "100%" }}
                      placeholder={t("WriteResult")}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Space>
      </div>
    )),
  };

  return (
    <Modal
      title={
        <Typography.Text type="secondary">
          {t("TestResultTitle")}{" "}
          <b style={{ color: "#000" }}>{record?.patient?.name}</b>
        </Typography.Text>
      }
      open={isResultsModal}
      width={600}
      onCancel={() => {
        setIsResultsModal(false);
        setRecord(null);
        setIsBarcode(false);
      }}
      footer={
        <div className={"results-modal-footer"}>

          {
            isBarcode ?
              null
              :
              <Space>
                <b>{t("FontSize")}</b>
                <Radio.Group
                  value={printFontSize}
                  onChange={(e) => setPrintFontSize(e.target.value)}
                >
                  <Tooltip title="12px">
                    <Radio value={12}>SM</Radio>
                  </Tooltip>
                  <Tooltip title="14px">
                    <Radio value={14}>MD</Radio>
                  </Tooltip>
                  <Tooltip title="16px">
                    <Radio value={16}>LG</Radio>
                  </Tooltip>
                </Radio.Group>
              </Space>
          }
          <Space>
            <Button
              onClick={() => {
                setIsResultsModal(false);
                setRecord(null);
                setIsBarcode(false);
              }}
            >
              {t("Close")}
            </Button>
            {
              isBarcode ?
                <Button type="primary" onClick={() => handleBarcode(record)}>
                  {t("PrintBarcode")}
                </Button>
                :
                <Button type="primary" onClick={handleSubmit}>
                  {t("SavePrint")}
                </Button>
            }
          </Space>
        </div>
      }
      centered
    >

      {
        isBarcode ?
          <div className="py-4">
            {t("printBarcodeConfirmation")}: {record?.patient?.name}
          </div>
          :
          <div className="results-modal" id="printJS-form">
            {record && renderTable[record?.testType]}
          </div>
      }
    </Modal>
  );
};

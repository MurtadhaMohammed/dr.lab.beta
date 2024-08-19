import { Modal, Space, Table, Tag, message,Popover } from "antd";
import "./style.css"; // Ensure this CSS file contains the styles shown below
import { usePatientStore } from "../../../libs/appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { getTotalPrice } from "../../../helper/price";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

export const PatientHistory = () => {
  const { id, isHistory, setIsHistory, setReset } = usePatientStore();
  const [data, setData] = useState([]);
  const { t } = useTranslation();

  const statusColor = {
    [t("PENDING")]: "orange",
    [t("COMPLETED")]: "green",
  };

  useEffect(() => {
    if (!id) return;
    send({
      query: "getVisitByPatient",
      patientId: id,
    }).then(({ err, data }) => {
      if (err) message.error("Error !");
      else setData(data);
    });
  }, [id]);
  const columns = [
    {
      title: t("Tests"),
      dataIndex: "tests",
      key: "tests",
      render: (_, record) => {
        let list = record?.tests;
        let numOfView = 2;
        let restCount =
          list?.length > numOfView ? list?.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {list?.slice(0, numOfView).map((el) => (
              <Tag key={el.id}>
                {el[record.testType === "CUSTOME" ? "name" : "title"]}
              </Tag>
            ))}
            {restCount && (
              <Popover
                content={
                  <div style={{ maxWidth: "300" }}>
                    <Space wrap>
                      {list?.map((el) => (
                        <Tag key={el.id}>
                          {el[record.testType === "CUSTOME" ? "name" : "title"]}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                }
              >
                <Tag>+{restCount}</Tag>
              </Popover>
            )}{" "}
          </Space>
        );
      },
    },
    {
      title: t("Price"),
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <span
          style={
            record?.discount
              ? {
                  textDecoration: "line-through",
                  opacity: 0.3,
                  fontStyle: "italic",
                }
              : {}
          }
        >
          {Number(
            getTotalPrice(record?.testType, record?.tests)
          ).toLocaleString("en")}
        </span>
      ),
    },
    {
      title: t("EndPrice"),
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (_, record) => (
        <b style={{ whiteSpace: "nowrap" }}>
          {Number(
            getTotalPrice(record?.testType, record?.tests) - record?.discount
          ).toLocaleString("en")}{" "}
          IQD
        </b>
      ),
    },
    {
      title: t("Discount"),
      dataIndex: "discount",
      key: "discount",
      render: (_, record) =>
        record?.discount ? (
          <Tag color="geekblue">{`${Number(record?.discount).toLocaleString(
            "en"
          )} IQD`}</Tag>
        ) : (
          ". . ."
        ),
    },
    {
      title: t("VisitDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span style={{ color: "#666" }}>
          {dayjs(createdAt).format("DD/MM/YYYY hh:mm A")}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        data?.length > 0
          ? `${t("PatientHistoryFor")} ${data[0]?.patient?.name}`
          : t("PatientHistory")
      }
      open={isHistory}
      width={800}
      onCancel={() => {
        setIsHistory(false);
        setReset();
      }}
      footer={null}
      centered
      className="patient-history-modal" // Add a custom class for styling
    >
      <div className="history-table-container">
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
          rowKey={(record) => record.id}
        />
      </div>
    </Modal>
  );
};

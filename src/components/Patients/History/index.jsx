import { Modal, Space, Table, Tag, message } from "antd";
import "./style.css";
import { usePatientStore } from "../../../appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { getTotalPrice } from "../../../helper/price";
import dayjs from "dayjs";

const statusColor = {
  PENDING: "orange",
  COMPLETED: "green",
};

export const PatientHistory = () => {
  const { id, isHistory, setIsHistory, setReset } = usePatientStore();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!id) return;
    send({
      doc: "visits",
      query: "find",
      search: {
        "patient._id": id,
      },
    }).then(({ err, rows }) => {
      if (err) message.error("Error !");
      else setData(rows);
    });
  }, [id]);

  const columns = [
    {
      title: "Tests",
      dataIndex: "tests",
      key: "tests",
      render: (_, record) => {
        let list = record?.tests;
        let numOfView = 3;
        let restCount =
          list?.length > numOfView ? list?.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {list?.slice(0, numOfView).map((el) => (
              <Tag>{el[record.testType === "CUSTOME" ? "name" : "title"]}</Tag>
            ))}
            {restCount && <Tag>+{restCount}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Price",
      dataIndex: "_id",
      key: "_id",
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
      title: "End Price",
      dataIndex: "_id",
      key: "_id",
      render: (_, record) => (
        <b style={{ whiteSpace: "nowarp" }}>
          {Number(
            getTotalPrice(record?.testType, record?.tests) - record?.discount
          ).toLocaleString("en")}{" "}
          IQD
        </b>
      ),
    },
    {
      title: "Discount",
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
      title: "Visit Date",
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
        data[0]
          ? `Patient history for ${data[0]?.patient?.name}`
          : "Patient history"
      }
      open={isHistory}
      width={800}
      onCancel={() => {
        setIsHistory(false);
        setReset();
      }}
      footer={null}
      centered
    >
      <div className="history">
        <Table
          //style={{ marginTop: "-16px" }}
          columns={columns}
          dataSource={data}
          pagination={false}
          size="small"
        />
      </div>
    </Modal>
  );
};

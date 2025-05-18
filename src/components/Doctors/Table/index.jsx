import {
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Button, Pagination, Popconfirm, Space, Table, message } from "antd";
import "./style.css";
import dayjs from "dayjs";
import { useAppStore, useDoctorStore } from "../../../libs/appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { useTranslation } from "react-i18next";
import usePageLimit from "../../../hooks/usePageLimit";
import { useAppTheme } from "../../../hooks/useAppThem";

export const PureTable = () => {
  const { isReload, setIsReload } = useAppStore();
  const {
    setIsModal,
    setId,
    setName,
    setBirth,
    setGender,
    setEmail,
    setPhone,
    setCreatedAt,
    querySearch,
    setAddress,
    setType,
    setIsHistory
  } = useDoctorStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = usePageLimit();
  const { appColors } = useAppTheme();

  const { t } = useTranslation();

  const columns = [
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: t("Gender"),
      dataIndex: "gender",
      key: "gender",
      render: (gender) =>
        gender === "male" ? (
          <ManOutlined style={{ color: "#0000ff", fontSize: 16 }} />
        ) : (
          <WomanOutlined style={{ color: "rgb(235, 47, 150)", fontSize: 16 }} />
        ),
    },
    {
      title: t("DoctorAddress"),
      dataIndex: "address",
      key: "address",
      render: (text) => text || "...",
    },
    {
      title: t("DoctorType"),
      dataIndex: "type",
      key: "type",
      render: (text) => text || "...",
    },

    {
      title: t("Email"),
      dataIndex: "email",
      key: "email",
      render: (text) =>
        text ? (
          <span style={{ color: "#666" }}>{text}</span>
        ) : (
          <span style={{ color: "#c6c6c6" }}>{t("HasNoEmail")}</span>
        ),
    },
    {
      title: t("Phone"),
      dataIndex: "phone",
      key: "phone",
      render: (text) =>
        text ? (
          <span style={{ color: "#666" }}>{text}</span>
        ) : (
          <span style={{ color: "#c6c6c6" }}>{t("HasNoPhone")}</span>
        ),
    },
    {
      title: t("CreatedAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span style={{ color: "#666" }}>
          {dayjs(createdAt).add(3, "hour").format("DD/MM/YYYY hh:mm A")}
        </span>
      ),
    },

    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Space size="small" className="custom-actions">
          <Button
            onClick={() => {
              setIsHistory(true);
              setId(record?.id);
            }}
            style={{ fontSize: 12 }}
            size="small"
          >
            {t("ViewDoctorHistory")}
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title={t("DeleteTheRecord")}
            description={t("DeleteThisRecord")}
            onConfirm={() => handleRemove(record.id)}
            okText="Yes"
            cancelText="No"
            placement="leftBottom"
          >
            <Button danger size="small" icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleRemove = (id) => {
    send({
      query: "deleteDoctor",
      id,
    })
      .then((resp) => {
        if (resp.data?.success) {
          console.log("Number of deleted rows:", resp.data.rowsDeleted);
          message.success(t("Patientremovedsuccessfully"));
          setIsReload(!isReload);
        } else {
          console.error("Error deleting patient:", resp.error);
          message.error(t("Failedtoremovepatient"));
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with the server.");
      });
  };

  const handleEdit = ({
    id,
    name,
    phone,
    email,
    gender,
    address,
    type,
    createdAt,
  }) => {
    setId(id);
    setName(name);
    setEmail(email);
    setPhone(phone);
    setGender(gender);
    setAddress(address);
    setType(type);
    setIsModal(true);
    setCreatedAt(createdAt);
  };

  useEffect(() => {
    setLoading(true);
    send({
      query: "getDoctors",
      q: querySearch,
      skip: (page - 1) * limit,
      limit,
    })
      .then((resp) => {
        if (resp.success) {
          setData(resp.data);
          setTotal(resp?.total);
        } else {
          console.error("Error fetching doctors:", resp.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
        setLoading(false);
      });
  }, [page, isReload, querySearch, limit]);

  return (
    <Table
      style={{
        marginTop: 16,
        border: `1px solid ${appColors.colorBorder}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      size="small"
      footer={() => (
        <div className="table-footer app-flex-space">
          <div
            className="pattern-isometric pattern-indigo-400 pattern-bg-white 
  pattern-size-6 pattern-opacity-5 absolute inset-0"
          ></div>
          <p>
            <b>{total}</b> {t("results")}
          </p>
          <Pagination
            simple
            current={page}
            onChange={(_page) => {
              setPage(_page);
            }}
            total={total}
            pageSize={limit}
            showSizeChanger={false}
          />
        </div>
      )}
    />
  );
};

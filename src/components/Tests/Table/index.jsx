import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
import { send } from "../../../control/renderer";
import { useEffect, useState } from "react";
import { useAppStore, useTestStore } from "../../../appStore";
import { useTranslation } from "react-i18next";

export const PureTable = () => {
  const { isReload, setIsReload } = useAppStore();
  const {
    setIsModal,
    setName,
    setPrice,
    setNormal,
    setId,
    setCreatedAt,
    querySearch,
    setOptions,
    setIsSelecte
  } = useTestStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const { t } = useTranslation();

  const columns = [
    {
      title: t("TestName"),
      dataIndex: "name",
      key: "name",
      render: (name) => <b>{name}</b>,
    },
    {
      title: t("NormalValue"),
      dataIndex: "normal",
      key: "normal",
      render: (normal) => normal || ". . .",
    },
    {
      title: t("Price"),
      dataIndex: "price",
      key: "price",
      render: (price) => <b>{Number(price).toLocaleString("en")} IQD</b>,
    },

    {
      title: t("LastUpdate"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => (
        <span style={{ color: "#666" }}>
          {dayjs(updatedAt).format("DD/MM/YYYY hh:mm A")}
        </span>
      ),
    },

    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Space size="small" className="custom-actions">
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
      query: "deleteTest",
      id,
    }).then(resp => {
      if (resp.success) {
        console.log("Success deleting test");
        setIsReload(!isReload);
      } else {
        console.error("Error deleting Test:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });


  };

  const handleEdit = ({ id, name, normal, price, options, isSelecte, createdAt }) => {
    setId(id);
    setName(name);
    setPrice(price);
    setNormal(normal);
    setIsModal(true);
    setCreatedAt(createdAt);
    setIsSelecte(isSelecte);
    setOptions(options || []);
  };

  useEffect(() => {
    let queryKey = querySearch ? querySearch : "";

    send({
      query: "getTests",
      data: { q: queryKey, skip: (page - 1) * limit, limit }
    }).then(resp => {
      if (resp.success) {
        setData(resp.data);
        setTotal(resp.total);
        console.log("Tests get successfully:", resp.data);
      } else {
        console.error("Error get tests:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
    });

  }, [page, isReload, querySearch]);

  return (
    <>
      <Table
        style={{ marginTop: "-16px" }}
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
      />
      <div className="table-footer app-flex-space">
        <p>
          <b>{total}</b>{t("results")}
        </p>
        <Pagination
          simple
          current={page}
          onChange={(_page) => {
            setPage(_page);
          }}
          total={total}
          pageSize={limit}
        />
      </div>
    </>
  );
};

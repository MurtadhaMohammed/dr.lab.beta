import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Pagination,
  Popconfirm,
  Popover,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
import { send } from "../../../control/renderer";
import { useEffect, useState } from "react";
import { useAppStore, useTestStore } from "../../../libs/appStore";
import { useTranslation } from "react-i18next";
import usePageLimit from "../../../hooks/usePageLimit";

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
    setIsSelecte,
  } = useTestStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = usePageLimit(60, 35);
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
      render: (normal) =>
        normal?.length > 30 ? (
          <Popover content={<div className="max-w-[260px]">{normal}</div>}>
            {normal.substr(0, 30)}...
          </Popover>
        ) : (
          normal || ". . ."
        ),
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
    })
      .then((resp) => {
        if (resp.success) {
          console.log("Success deleting test");
          setIsReload(!isReload);
        } else {
          console.error("Error deleting Test:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  const handleEdit = ({
    id,
    name,
    normal,
    price,
    options,
    isSelecte,
    createdAt,
  }) => {
    console.log("Edit Test Data:::::::::::::::::", {
      id,
      name,
      normal,
      price,
      options,
      isSelecte,
      createdAt,
    });
  
    let parsedOptions = options;
  
    if (typeof options === 'string') {
      try {
        parsedOptions = JSON.parse(options);
      } catch (error) {
        console.error("Error parsing options:", error);
        parsedOptions = [];
      }
    }
  
    setId(id);
    setName(name);
    setPrice(price);
    setNormal(normal);
    setIsModal(true);
    setCreatedAt(createdAt);
    setIsSelecte(isSelecte);
    setOptions(Array.isArray(parsedOptions) ? parsedOptions : []);
  };

  useEffect(() => {
    let queryKey = querySearch ? querySearch : "";

    send({
      query: "getTests",
      data: { q: queryKey, skip: (page - 1) * limit, limit },
    })
      .then((resp) => {
        if (resp.success) {
          setData(resp.data);
          setTotal(resp.total);
          console.log("Tests get successfully:", resp.data);
        } else {
          console.error("Error get tests:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  }, [page, isReload, querySearch, limit]);

  return (
    <Table
      style={{
        marginTop: 16,
        border: "1px solid #eee",
        borderRadius: 10,
        overflow: "hidden",
      }}
      columns={columns}
      dataSource={data}
      pagination={false}
      size="small"
      footer={() => (
        <div className="table-footer app-flex-space ">
            <div
            class="pattern-isometric pattern-indigo-400 pattern-bg-white 
  pattern-size-6 pattern-opacity-5 absolute inset-0 "
          ></div>
          <p>
            <b>{total}</b> {t("results")}
          </p>
          <Pagination
          className="flex flex-row justify-center items-center"
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

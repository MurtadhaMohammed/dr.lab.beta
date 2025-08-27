import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Pagination,
  Popconfirm,
  Space,
  Table,
  message,
  Tag,
  Typography,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
import { send } from "../../../control/renderer";
import { useEffect, useState } from "react";
import { useAppStore, useTestStore, useTrigger } from "../../../libs/appStore";
import { useTranslation } from "react-i18next";
import usePageLimit from "../../../hooks/usePageLimit";
import { useAppTheme } from "../../../hooks/useAppThem";
import { formatRefText } from "../../../helper/refTextFormatter";
import { MetaJsonModal } from "./metaJsonModal";

export const PureTable = () => {
  const { isReload, setIsReload } = useAppStore();
  const { setIsModal, setInitialData, querySearch } = useTestStore();
  const [data, setData] = useState([]);
  const [isMetaModal, setIsMetaModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = usePageLimit(65, 35);
  const { t } = useTranslation();
  const { setFlag, setTest } = useTrigger();
  const { appColors } = useAppTheme();

  console.log(record)

  const columns = [
    {
      title: t("TestName"),
      dataIndex: "name_en",
      key: "name_en",
      render: (name_en, row) => (
        <div>
          <Typography.Text className="text-[14px] font-bold">
            {name_en}
          </Typography.Text>

          {row?.type !== "single" && (
            <Space size={2}>
              <Typography.Text className="ml-1">-</Typography.Text>
              <Typography.Text type="secondary" className="text-[12px]">
                {row?.name_ar}
              </Typography.Text>
            </Space>
          )}
        </div>
      ),
    },

    {
      title: t("View"),
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colors = {
          single: "geekblue",
          panel: "magenta",
          composite: "purple",
        };

        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: t("Unit"),
      dataIndex: "unit",
      key: "unit",
      render: (unit) => (
        <Typography.Text type="secondary" className="text-[12px]">
          {unit}
        </Typography.Text>
      ),
    },
    {
      title: t("NormalValue"),
      dataIndex: "ref_text",
      key: "ref_text",
      render: (ref_text, record) => (
        <div className="max-w-[260px]">
          {formatRefText(ref_text, record?.unit)}
        </div>
      ),
    },

    {
      title: t("Sample"),
      dataIndex: "sample_type",
      key: "sample_type",
      render: (sample_type) => <Tag>{sample_type}</Tag>,
    },
    {
      title: t("Price"),
      dataIndex: "price_iqd",
      key: "price_iqd",
      render: (price_iqd) => (
        <b>{Number(price_iqd).toLocaleString("en")} IQD</b>
      ),
    },

    {
      title: t("LastUpdate"),
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updated_at) => (
        <span style={{ color: "#666" }}>
          {dayjs(updated_at).add(3, "hour").format("DD/MM/YYYY hh:mm A")}
        </span>
      ),
    },

    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Space size="small" className="custom-actions">
          {record?.type !== "single" && <Button
            size="small"
            //icon={<EditOutlined />}
            onClick={() => {
              setRecord(record);
              setIsMetaModal(true);
            }}
            type="primary"
          >
            Customize
          </Button>}
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
          message.success(t("Testdeletedsuccessfully"));
          setIsReload(!isReload);
        } else {
          console.error("Error deleting Test:", resp.error);
          message.error(t("Failedtodeletetest"));
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with server.");
      });
  };

  const handleEdit = (row) => {
    setInitialData(row);
    setIsModal(true);
  };

  useEffect(() => {
    let queryKey = querySearch ? querySearch : "";

    setLoading(true);

    send({
      query: "getTests",
      data: { q: queryKey, skip: (page - 1) * limit, limit },
    })
      .then((resp) => {
        if (resp.success) {
          setData(resp.data);
          setTotal(resp.total);
          setTest(resp.data);
          setFlag(true);
        } else {
          console.error("Error get tests:", resp.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  }, [page, isReload, querySearch, limit]);

  return (
    <>
      <Table
        style={{
          marginTop: 16,
          border: `1px solid ${appColors.colorBorder}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
        loading={loading}
        columns={columns}
        rowKey={(row) => row.id}
        dataSource={data}
        pagination={false}
        size="small"
        footer={() => (
          <div className="table-footer app-flex-space ">
            <div
              className="pattern-isometric pattern-indigo-400 pattern-bg-white 
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

      <MetaJsonModal
        open={isMetaModal}
        type={record?.type} // "panel" | "composite" | "single"
        initialMetaJson={record?.meta_json} // string أو object
        onCancel={() => setIsMetaModal(false)}
        onSubmit={(jsonString) => {
          console.log(jsonString);
        }}
      />
    </>
  );
};

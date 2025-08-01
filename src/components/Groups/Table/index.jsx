import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  Pagination,
  Popconfirm,
  Space,
  Table,
  Tag,
  Popover,
  message,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
// import { getEndPrice } from "../../../helper/price";
import { send } from "../../../control/renderer";
import { useAppStore, useGroupStore } from "../../../libs/appStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import usePageLimit from "../../../hooks/usePageLimit";
import { useAppTheme } from "../../../hooks/useAppThem";

export const PureTable = () => {
  const { isReload, setIsReload } = useAppStore();
  const {
    setIsModal,
    setTitle,
    setCustomePrice,
    setTests,
    setId,
    setCreatedAt,
    querySearch,
  } = useGroupStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const limit = usePageLimit(60, 35);
  const {appColors, appTheme} = useAppTheme();

  const columns = [
    {
      title: t("PackageTitle"),
      dataIndex: "title",
      key: "title",
      render: (title) => <b style={{ whiteSpace: "nowarp" }}>{title}</b>,
    },
    {
      title: t("Tests"),
      dataIndex: "tests",
      key: "tests",
      render: (tests) => {
        let numOfView = 2;
        let restCount =
          tests.length > numOfView ? tests.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {tests.slice(0, numOfView).map((el, i) => (
              <Tag color="purple" className={appTheme === "dark" ? "!text-white !border-[#45325c]" : ""} key={i}>{el.name}</Tag>
            ))}
            {restCount && (
              <Popover
                content={
                  <div style={{ maxWidth: 360 }}>
                    <Space wrap size={6}>
                      {tests?.map((el) => (
                        <Tag className="!m-0" key={el.id}>{el.name}</Tag>
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
      title: t("TotalPrice"),
      dataIndex: "id",
      key: "id",
      render: (_, record) => {
        let totalPrice = record?.tests
          ?.map((el) => el?.price)
          ?.reduce((a, b) => a + b, 0);
        return record?.customePrice && record?.customePrice !== totalPrice ? (
          <span
            key={record.id}
            style={{
              textDecoration: "line-through",
              opacity: 0.3,
              fontStyle: "italic",
            }}
          >
            {Number(totalPrice).toLocaleString("en")} IQD
          </span>
        ) : (
          <b>{Number(totalPrice).toLocaleString("en")} IQD</b>
        );
      },
    },
    {
      title: t("CustomePrice"),
      dataIndex: "customePrice",
      key: "customePrice",
      render: (_, record) => {
        return !record?.customePrice ? (
          ". . ."
        ) : (
          <b>{Number(record?.customePrice).toLocaleString("en")} IQD</b>
        );
      },
    },

    {
      title: t("LastUpdate"),
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => (
        <span style={{ color: "#666" }}>
          {dayjs(updatedAt).add(3, "hour").format("DD/MM/YYYY hh:mm A")}
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
      query: "deletePackage",
      id,
    })
      .then((resp) => {
        if (resp.success) {
          message.success(t("Packagedeletedsuccessfully"));
          setIsReload(!isReload);
        } else {
          console.error("Error deletePackage:", resp.error);
          message.error(t("Failedtodeletepackage"));
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with server.");
      });
  };

  const handleEdit = ({ id, title, tests, customePrice, createdAt }) => {
    setId(id);
    setTitle(title);
    setCustomePrice(customePrice);
    setTests(tests);
    setIsModal(true);
    setCreatedAt(createdAt);
  };

  useEffect(() => {
    let queryKey = querySearch ? querySearch : "";

    send({
      query: "getPackages",
      data: { q: queryKey, skip: (page - 1) * limit, limit },
    })
      .then((resp) => {
        if (resp.success) {
          setData(resp.data);
          setTotal(resp.total);
        } else {
          console.error("Error retrieving packages:", resp.error);
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
        border: `1px solid ${appColors.colorBorder}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
      columns={columns}
      dataSource={data}
      rowKey={(row) => row.id}
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

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

  const columns = [
    {
      title: "Test Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <b>{name}</b>,
    },
    {
      title: "Normal Value",
      dataIndex: "normal",
      key: "normal",
      render: (normal) => normal || ". . .",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => <b>{Number(price).toLocaleString("en")} IQD</b>,
    },

    {
      title: "Last Update",
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
            title="Delete the record"
            description="Are you sure to delete this record?"
            onConfirm={() => handleRemove(record._id)}
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

  const handleRemove = (_id) => {
    send({
      doc: "tests",
      query: "remove",
      condition: { _id },
    }).then(({ err }) => {
      if (err) message.error("Error !");
      else {
        message.success("Remove Succefful.");
        setIsReload(!isReload);
      }
    });
  };

  const handleEdit = ({ _id, name, normal, price, options,isSelecte,  createdAt }) => {
    setId(_id);
    setName(name);
    setPrice(price);
    setNormal(normal);
    setIsModal(true);
    setCreatedAt(createdAt);
    setIsSelecte(isSelecte);
    setOptions(options || []);
  };

  useEffect(() => {
    let queryKey = new RegExp(querySearch, "gi");

    send({
      doc: "tests",
      query: "find",
      search: { name: queryKey },
      limit,
      skip: (page - 1) * limit,
    }).then(({ err, rows }) => {
      if (err) message.error("Error !");
      else {
        setData(rows);
        setTimeout(() => {
          send({
            doc: "tests",
            query: "count",
            search: { name: queryKey },
          }).then(({ err, count }) => {
            if (err) message.error("Error !");
            else setTotal(count);
          });
        }, 100);
      }
    });
  }, [page, isReload, querySearch]);

  // useEffect(() => {
  //   if (page !== 1) {
  //     setPage(1);
  //   }
  // }, [isReload]);

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
          <b>{total}</b> results fot this search
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

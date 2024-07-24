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
// import { getEndPrice } from "../../../helper/price";
import { send } from "../../../control/renderer";
import { useAppStore, useGroupStore } from "../../../appStore";
import { useEffect, useState } from "react";

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
  const limit = 10;

  const columns = [
    {
      title: "Package Title",
      dataIndex: "title",
      key: "title",
      render: (title) => <b style={{ whiteSpace: "nowarp" }}>{title}</b>,
    },
    {
      title: "Tests",
      dataIndex: "tests",
      key: "tests",
      render: (tests) => {
        let numOfView = 4;
        let restCount =
          tests.length > numOfView ? tests.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {tests.slice(0, numOfView).map((el) => (
              <Tag>{el.name}</Tag>
            ))}
            {restCount && <Tag>+{restCount}</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Total Price",
      dataIndex: "id",
      key: "id",
      render: (_, record) => {
        let totalPrice = record?.tests
          ?.map((el) => el?.price)
          ?.reduce((a, b) => a + b, 0);
        return record?.customePrice && record?.customePrice !== totalPrice ? (
          <span
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
      title: "Custome Price",
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
    // send({
    //   doc: "packages",
    //   query: "remove",
    //   condition: { id },
    // }).then(({ err }) => {
    //   if (err) message.error("Error !");
    //   else {
    //     message.success("Remove Succefful.");
    //     setIsReload(!isReload);
    //   }
    // });

    send({
      query: "deletePackage",
     id
    }).then(resp => {
      if (resp.success) {
        console.log("Success deletePackage");
        setIsReload(!isReload);
      } else {
        console.error("Error deletePackage:", resp.error);
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
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
    // send({
    //   doc: "packages",
    //   query: "find",
    //   search: { title: queryKey },
    //   limit,
    //   skip: (page - 1) * limit,
    // }).then(({ err, rows }) => {
    //   if (err) message.error("Error !");
    //   else {
    //     setData(rows);
    //     setTimeout(() => {
    //       send({
    //         doc: "packages",
    //         query: "count",
    //         search: { title: queryKey },
    //       }).then(({ err, count }) => {
    //         if (err) message.error("Error !");
    //         else setTotal(count);
    //       });
    //     }, 100);
    //   }
    // });


    send({
      query: "getPackages",
      data: { q: queryKey, skip: (page - 1) * limit, limit }
    }).then(resp => {
      if (resp.success) {
        setData(resp.data);
        console.log("Packages retrieved successfully:", resp.data);
      } else {
        console.error("Error retrieving packages:", resp.error);
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

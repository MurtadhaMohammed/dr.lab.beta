import {
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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
import { useAppStore, usePatientStore } from "../../../appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";

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
    setUID,
    querySearch,
    setIsHistory
  } = usePatientStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const columns = [
    {
      title: "#",
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
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <b>{text}</b>,
    },
    {
      title: "Age",
      dataIndex: "birth",
      key: "birth",
      render: (birth) => (
        <p>
          {dayjs().diff(dayjs(birth), "y")}{" "}
          <span style={{ color: "#666" }}>year</span>
        </p>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) =>
        text ? (
          <span style={{ color: "#666" }}>{text}</span>
        ) : (
          <span style={{ color: "#c6c6c6" }}>Has no email !.</span>
        ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text) =>
        text ? (
          <span style={{ color: "#666" }}>{text}</span>
        ) : (
          <span style={{ color: "#c6c6c6" }}>Has no phone !.</span>
        ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span style={{ color: "#666" }}>
          {dayjs(createdAt).format("DD/MM/YYYY hh:mm A")}
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
            View History
          </Button>
          <Divider type="vertical" />
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
    //   doc: "patients",
    //   query: "remove",
    //   condition: { _id },
    // }).then(({ err }) => {
    //   if (err) message.error("Error !");
    //   else {
    //     message.success("Remove Succefful.");
    //     setIsReload(!isReload);
    //   }
    // });

    send({
      query: "deletePatient",
      id
    }).then(resp => {
      if (resp.success) {
        console.log("Number of deleted rows:", resp.data.rowsDeleted);
        message.success(`Removed Patient successfully.`);
        setIsReload(!isReload);
      } else {
        console.error("Error deleting patient:", resp.error);
        message.error("Error removing patient.");
      }
    }).catch(err => {
      console.error("Error in IPC communication:", err);
      message.error("Error in IPC communication.");
    });

    console.log("ttttttttttttt", id);

  };




  const handleEdit = ({
    id,
    name,
    birth,
    phone,
    email,
    gender,
    createdAt,
  }) => {
    setId(id);
    setBirth(dayjs(birth));
    setName(name);
    setEmail(email);
    setPhone(phone);
    setGender(gender);
    setIsModal(true);
    setCreatedAt(createdAt);
  };

  useEffect(() => {
    let queryKey = new RegExp(querySearch, "gi");

    // send({
    //   doc: "patients",
    //   query: "find",
    //   search: { name: queryKey },
    //   limit,
    //   skip: (page - 1) * limit,
    // }).then(({ err, rows }) => {
    //   if (err) message.error("Error !");
    //   else {
    //     setData(rows);
    //     console.log(rows);
    //     setTimeout(() => {
    //       send({
    //         doc: "patients",
    //         query: "count",
    //         search: { name: queryKey },
    //       }).then(({ err, count }) => {
    //         if (err) message.error("Error !");
    //         else setTotal(count);
    //       });
    //     }, 100);
    //   }
    // });


    send({
      query: "getPatients",
      q: querySearch,
      skip: 0,
      limit: 10
    }).then(resp => {
      if (resp.success) {
        setData(resp.data);
        console.log("Patients data:", resp.data);
      } else {
        console.error("Error fetching patients:", resp.error);
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

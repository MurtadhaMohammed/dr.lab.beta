import {
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  DeleteOutlined,
  WhatsAppOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import {
  Button,
  Divider,
  Pagination,
  Space,
  Table,
  Tag,
  Popconfirm,
  message,
  Popover,
  Input,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
import { getTotalPrice } from "../../../helper/price";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { useAppStore, useHomeStore, useReportsStore } from "../../../appStore";
import { parseTests } from "../ResultsModal";
import { constructFileFromLocalFileData } from "get-file-object-from-local-path";
import {
  ACCESS_TOKEN_DBX,
  sendMessage,
  uploadFile,
  uploadFileDbx,
} from "../../../helper/whatsapp";
import { Dropbox } from "dropbox";
import { nanoid } from "nanoid";

var dbx = new Dropbox({ accessToken: ACCESS_TOKEN_DBX });

const statusColor = {
  PENDING: "orange",
  COMPLETED: "green",
};

export const PureTable = ({ isReport = false }) => {
  const { isReload, setIsReload, printFontSize } = useAppStore();
  const {
    setIsModal,
    setId,
    setName,
    setTestType,
    setBirth,
    setGender,
    setDiscount,
    setEmail,
    setPhone,
    setTests,
    setCreatedAt,
    setUID,
    querySearch,
    setIsResultsModal,
    setRecord,
    isToday,
  } = useHomeStore();
  const { filterDate } = useReportsStore();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [msgLoading, setMsgLoading] = useState(false);
  const [tempLoading, setTempLoading] = useState(false);
  const [isSend, setIsSend] = useState(false);
  const [destPhone, setDestPhone] = useState(null);
  const limit = 10;

  const phoneValidate = (phone) => {
    if (phone?.length < 11) return false;
    const regex = /^[\u0621-\u064A\u0660-\u0669]+|07[3-9]\d{1,11}$/;
    const result = regex.exec(phone);
    return result;
  };

  //https://lab-beta-api.onrender.com

  // const sendMsg = async (file, type) => {
  //   setMsgLoading(true);
  //   var formdata = new FormData();
  //   type === "message" && formdata.append("file", file);
  //   formdata.append("phone", destPhone);
  //   try {
  //     let res = await fetch(
  //       `http://lab-beta-api.onrender.com/api/lab/${type}`,
  //       {
  //         method: "POST",
  //         body: formdata,
  //       }
  //     );
  //     let resData = await res.json();
  //     setMsgLoading(false);
  //     if (resData?.success) {
  //       type === "message" && setIsSend(true);
  //       message.success("تم الارسال بنجاح.");
  //     } else message.error("مشكلة بالنظام حاول لاحقا!");
  //   } catch (error) {
  //     setMsgLoading(false);
  //     console.log(error);
  //   }
  // };

  //   {
  //     "name": "dUaZ-OH2uPVlyhhW-WPkN.pdf",
  //     "path_lower": "/duaz-oh2upvlyhhw-wpkn.pdf",
  //     "path_display": "/dUaZ-OH2uPVlyhhW-WPkN.pdf",
  //     "id": "id:qvxxrWPlqCAAAAAAAAAAIA",
  //     "client_modified": "2023-10-14T14:02:51Z",
  //     "server_modified": "2023-10-14T14:02:51Z",
  //     "rev": "607ada0f32b4bfd55e830",
  //     "size": 7168610,
  //     "is_downloadable": true,
  //     "content_hash": "ebb92f2d98540cb8378a9890ae6694b945458a2f63758873cd611e2982767abf"
  // }

  const getUrlFromDBX = async (path) => {
    try {
      const response = await fetch(
        "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
        {
          body: JSON.stringify({
            path,
            settings: {
              access: "viewer",
              allow_download: true,
              audience: "public",
              requested_visibility: "public",
            },
          }),
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN_DBX}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        }
      );
      const data = await response.json();
      if (data?.error) return { success: false, ...data };
      else return { success: true, ...data };
    } catch (error) {
      return { success: false, ...error };
    }
  };

  const handleSandWhatsap = async (record, type) => {
    let phone = destPhone;
    if (!phoneValidate(phone)) {
      message.error("رقم الهاتف غير صحيح!");
      return;
    } else if (phone[0] === "0") phone = phone.substr(1);
    {
      let data = {
        patient: record.patient.name,
        age: dayjs().diff(dayjs(record.patient.birth), "y"),
        date: dayjs(record.createdAt).format("YYYY-MM-DD"),
        tests: parseTests(record),
        isHeader: true,
        fontSize: printFontSize,
      };
      send({
        query: "print",
        isView: false,
        data,
      }).then(async ({ err, res, file }) => {
        if (err) throw err;
        if (type === "document") {
          // let msgResp = await sendMessage("template", destPhone, null, "hello");
          // if (!msgResp.success)
          //   message.error("مشكلة في الارسال حاول مجددا !");
          // else message.success("تم الارسال بنجاح");
          setMsgLoading(true);
          const fileObject = constructFileFromLocalFileData(file);
          // dbx
          //   .filesUpload({
          //     path: "/" + `${nanoid()}.pdf`,
          //     contents: fileObject,
          //   })
          //   .then(async function (response) {
          //     if (response?.status === 200) {
          //       let respUrl = await getUrlFromDBX(
          //         response?.result?.path_display
          //       );
          //       if (!respUrl?.success)
          //         message.error("مشكلة في الارسال حاول مجددا !");
          //       else {
          //         let msgResp = await sendMessage("template", destPhone, null, respUrl?.url);
          //         if (!msgResp.success)
          //           message.error("مشكلة في الارسال حاول مجددا !");
          //         else message.success("تم الارسال بنجاح");
          //       }
          //     } else message.error("مشكلة في الارسال حاول مجددا !");
          //   })
          //   .catch(function (error) {
          //     message.error("مشكلة في الارسال حاول مجددا !");
          //   });

          let fileResp = await uploadFile(fileObject);
          if (!fileResp?.success)
            message.error("مشكلة في الارسال حاول مجددا !");
          else {
            let msgResp = await sendMessage(type, destPhone, fileResp?.id);
            if (!msgResp.success)
              message.error("مشكلة في الارسال حاول مجددا !");
            else {
              message.success("تم الارسال بنجاح");
              setIsSend(true);
            }
          }
          setMsgLoading(false);
        } else if (type === "template") {
          setTempLoading(true);
          let msgResp = await sendMessage(type, destPhone);
          if (!msgResp.success) message.error("مشكلة في الارسال حاول مجددا !");
          else message.success("تم الارسال بنجاح");
          setTempLoading(false);
        }
      });
    }
  };

  const whatsapContnet = (record) => (
    <div className="whatsap-content">
      <WhatsAppOutlined style={{ fontSize: 40 }} />
      <b>Send Results</b>
      <p>Send resuls on Whatsaap</p>
      <Input
        placeholder="Enter Phone Number"
        value={destPhone}
        onChange={(e) => setDestPhone(e.target.value)}
      />
      <Divider />
      <Button
        loading={tempLoading}
        disabled={!destPhone || !phoneValidate(destPhone) || msgLoading}
        onClick={() => handleSandWhatsap(record, "template")}
        block
      >
        Say Hello
      </Button>
      <Button
        style={{ marginTop: 10 }}
        loading={msgLoading}
        disabled={!destPhone || !phoneValidate(destPhone) || tempLoading}
        onClick={() => handleSandWhatsap(record, "document")}
        type="primary"
        block
      >
        Send Result
      </Button>
    </div>
  );

  const whatsapfinish = (
    <div className="whatsap-finish">
      <FileDoneOutlined style={{ fontSize: 60, color: "green" }} />
      <b>ارسال ناجح</b>
      <p>تم ارسال الرسالة بنجاح</p>
    </div>
  );

  const columns = [
    {
      title: "#",
      dataIndex: "gender",
      key: "gender",
      render: (_, record) =>
        record?.patientGender === "male" ? (
          <ManOutlined style={{ color: "#0000ff", fontSize: 16 }} />
        ) : (
          <WomanOutlined style={{ color: "rgb(235, 47, 150)", fontSize: 16 }} />
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (_, record) => <b>{record?.patientName}</b>,
    },
    {
      title: "Tests",
      dataIndex: "tests",
      key: "tests",
      render: (_, record) => {

        let list = JSON.parse(record.tests) || [];
        let numOfView = 2;
        let restCount =
          list.length > numOfView ? list.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {list?.slice(0, numOfView).map((el) => (
              <Tag>{el[record.testType === "CUSTOME" ? "name" : "title"]}</Tag>
            ))}
            {restCount && (
              <Popover
                content={
                  <div style={{ maxWidth: "300" }}>
                    <Space wrap>
                      {list?.map((el) => (
                        <Tag>
                          {el[record.testType === "CUSTOME" ? "name" : "title"]}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                }
              >
                <Tag>+{restCount}</Tag>
              </Popover>
            )}
          </Space>
        );
      },
    },
    {
      title: "Price",
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
            getTotalPrice(record?.testType, JSON.parse(record?.tests))
          ).toLocaleString("en")}
        </span>
      ),
    },
    {
      title: "End Price",
      dataIndex: "id",
      key: "id",
      render: (_, record) => (
        <b style={{ whiteSpace: "nowarp" }}>
          {Number(
            getTotalPrice(record?.testType, JSON.parse(record?.tests)) -
            record?.discount
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
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span style={{ color: "#666" }}>
          <span style={{ fontSize: 12 }}>
            {dayjs(createdAt).format("DD/MM/YYYY")}
          </span>{" "}
          {dayjs(createdAt).format("hh:mm A")}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColor[status]}>{status}</Tag>,
    },
    {
      ...(!isReport && {
        title: "",
        key: "action",
        render: (_, record) => (
          <Space size="small" className="custom-actions">
            {/* {record?.status === "COMPLETED" && (
              <Popover
                trigger={"click"}
                onClick={() => {
                  setIsSend(false);
                  setDestPhone(record?.patient?.phone);
                }}
                content={isSend ? whatsapfinish : whatsapContnet(record)}
              >
                <Button
                  size="small"
                  disabled={record?.status !== "COMPLETED"}
                  icon={<WhatsAppOutlined />}
                ></Button>
              </Popover>
            )} */}

            {/* <Button
              onClick={async () => {
                let respUrl = await getUrlFromDBX();
                if (!respUrl?.success)
                  message.error("مشكلة في الارسال حاول مجددا !");
                else console.log(respUrl);
              }}
              style={{ fontSize: 12 }}
              size="small"
            >
              Print URL
            </Button> */}

            <Button
              onClick={() => handleResults(record)}
              style={{ fontSize: 12 }}
              size="small"
            >
              Print Results
            </Button>
            <Divider type="vertical" />
            <Button
              size="small"
              disabled={record?.status === "COMPLETED"}
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
      }),
    },
  ];

  const handleResults = (record) => {
    setRecord(record);
    setIsResultsModal(true);
  };

  const handleRemove = (id) => {
    send({
      query: "deleteVisit",
      id,
    })
      .then((resp) => {
        if (resp.success) {
          console.log("Success deleteVisit");
          setIsReload(!isReload);
        } else {
          console.error("Error deleteVisit:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  const handleEdit = ({
    id,
    patient,
    testType,
    discount,
    tests,
    createdAt,
  }) => {
    setId(id);
    setTests(JSON.parse(tests));
    setBirth(dayjs(patient?.birth));
    setName(patient?.name);
    setEmail(patient?.email);
    setPhone(patient?.phone);
    setGender(patient?.gender);
    setTestType(testType);
    setDiscount(discount);
    setIsModal(true);
    setUID(patient?.uID);
    setCreatedAt(createdAt);
  };

  useEffect(() => {
    let queryKey = new RegExp(querySearch, "gi");
    // send({
    //   doc: "visits",
    //   query: "find",
    //   search: {
    //     $and: [
    //       { "patient.name": queryKey },
    //       isReport
    //         ? {
    //             ...(filterDate && {
    //               createdAt: {
    //                 $gt: dayjs(
    //                   dayjs(filterDate[0]).format("YYYY-MM-DD")
    //                 ).valueOf(),
    //                 $lt: dayjs(
    //                   dayjs(filterDate[1]).format("YYYY-MM-DD")
    //                 ).valueOf(),
    //               },
    //             }),
    //           }
    //         : {
    //             ...(isToday && {
    //               createdAt: {
    //                 $gt: dayjs(dayjs().format("YYYY-MM-DD")).valueOf(),
    //               },
    //             }),
    //           },
    //     ],
    //   },
    //   limit,
    //   skip: (page - 1) * limit,
    // }).then(({ err, rows }) => {
    //   if (err) message.error("Error !");
    //   else {
    //     setData(rows);
    //     setTimeout(() => {
    //       send({
    //         doc: "visits",
    //         query: "count",
    //         search: {
    //           $and: [
    //             { "patient.name": queryKey },
    //             isReport
    //               ? {
    //                   ...(filterDate && {
    //                     createdAt: {
    //                       $gt: dayjs(
    //                         dayjs(filterDate[0]).format("YYYY-MM-DD")
    //                       ).valueOf(),
    //                       $lt: dayjs(
    //                         dayjs(filterDate[1]).format("YYYY-MM-DD")
    //                       ).valueOf(),
    //                     },
    //                   }),
    //                 }
    //               : {
    //                   ...(isToday && {
    //                     createdAt: {
    //                       $gt: dayjs(dayjs().format("YYYY-MM-DD")).valueOf(),
    //                     },
    //                   }),
    //                 },
    //           ],
    //         },
    //       }).then(({ err, count }) => {
    //         if (err) message.error("Error !");
    //         else setTotal(count);
    //       });
    //     }, 100);
    //   }
    // });

    send({
      query: "getVisits",
      data,
    }).then((resp) => {
      if (resp.success) {
        setData(resp.data);
        console.log("Visits retrieved successfully:", resp.data);
      } else {
        console.error("Error retrieving visits:", resp.error);
      }
    });
  }, [page, isReload, querySearch, isToday]);

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

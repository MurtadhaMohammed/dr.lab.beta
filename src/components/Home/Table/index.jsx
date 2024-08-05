import {
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  DeleteOutlined,
  WhatsAppOutlined,
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
  Checkbox,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
import { getTotalPrice } from "../../../helper/price";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import {
  useAppStore,
  useHomeStore,
  useReportsStore,
} from "../../../libs/appStore";
import usePageLimit from "../../../hooks/usePageLimit";
import { useTranslation } from "react-i18next";
import fileDialog from "file-dialog";
import { apiCall } from "../../../libs/api";

export const PureTable = ({ isReport = false }) => {
  const { isReload, setIsReload } = useAppStore();
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
    querySearch,
    setIsResultsModal,
    setRecord,
    isToday,
    setPatientID,
  } = useHomeStore();
  const { filterDate } = useReportsStore();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [msgLoading, setMsgLoading] = useState(false);
  const [tempLoading, setTempLoading] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [destPhone, setDestPhone] = useState(null);
  const limit = usePageLimit();
  const { t } = useTranslation();

  const phoneValidate = (phone) => {
    if (phone?.length < 11) return false;
    const regex = /^[\u0621-\u064A\u0660-\u0669]+|07[3-9]\d{1,11}$/;
    const result = regex.exec(phone);
    return result;
  };
  const statusColor = {
    PENDING: "orange",
    COMPLETED: "green",
  };

  const updatePatient = async (record, phone) => {
    let data = { ...record, phone };
    try {
      const resp = await send({
        query: "updatePatient",
        id: data?.id,
        data: { ...data },
      });

      if (resp.success) {
        setIsReload(!isReload);
      } else {
        console.error("Error updating patient:", resp.error);
      }
    } catch (error) {
      console.error("Error in IPC communication:", error);
    }
  };

  const handleSandWhatsap = async (record) => {
    if (destPhone !== record?.phone) await updatePatient(record, destPhone);
    let phone = destPhone;
    if (!phoneValidate(phone)) {
      message.error("رقم الهاتف غير صحيح!");
      return;
    } else if (phone[0] === "0") phone = phone.substr(1);

    fileDialog(async (files) => {
      setMsgLoading(true);
      const resp = await apiCall({
        method: "POST",
        pathname: "/send/whatsapp-message",
        isFormData: true,
        data: {
          name: record?.patient?.name,
          phone,
          lab: JSON.parse(localStorage?.getItem("lab-user"))?.labName || "",
          file: files[0],
        },
      });
      const data = await resp.json();
      if (data?.messages && data?.messages[0]?.message_status === "accepted") {
        message.success("Send Succefully.");
        setMsgLoading(false);
      } else {
        setMsgLoading(false);
        message.error("Error!");
      }
    });
  };

  const whatsapContnet = (record) => (
    <div className="whatsap-content">
      <WhatsAppOutlined style={{ fontSize: 40 }} />
      <b>{t("SendResults")}</b>
      <p>{t("SendResulsOnWhatsaap")}</p>
      <Input
        placeholder={t("EnterPhoneNumber")}
        value={destPhone}
        onChange={(e) => setDestPhone(e.target.value)}
      />

      <Space className="mt-[12px]">
        <Checkbox
          checked={isConfirm}
          onChange={(e) => setIsConfirm(e.target.checked)}
        />
        <span className="text-[14px]">{t("ConfirmPhoneNumber")}</span>
      </Space>

      <Divider />
      <Button
        loading={msgLoading}
        disabled={!isConfirm || !destPhone || !phoneValidate(destPhone)}
        onClick={() => handleSandWhatsap(record)}
        type="primary"
        block
      >
        {t("Send")}
      </Button>
    </div>
  );

  const columns = [
    {
      title: "#",
      dataIndex: "gender",
      key: "gender",
      render: (_, record) =>
        record?.patient?.gender === "male" ? (
          <ManOutlined style={{ color: "#0000ff", fontSize: 16 }} />
        ) : (
          <WomanOutlined style={{ color: "rgb(235, 47, 150)", fontSize: 16 }} />
        ),
    },
    {
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      render: (_, record) => <b>{record?.patient?.name}</b>,
    },
    {
      title: t("Tests"),
      dataIndex: "tests",
      key: "tests",
      render: (_, record) => {
        let testType = record.testType.replace(/^"|"$/g, ""); // Remove surrounding quotes
        let list = record.tests;
        let numOfView = 2;
        let restCount =
          list.length > numOfView ? list.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {list?.slice(0, numOfView).map((el) => (
              <Tag key={el.id}>
                {el[testType === t("CUSTOME") ? t("name") : t("title")]}
              </Tag>
            ))}
            {restCount && (
              <Popover
                content={
                  <div style={{ maxWidth: "300" }}>
                    <Space wrap>
                      {list?.map((el) => (
                        <Tag key={el.id}>
                          {
                            el[
                              testType === t("CUSTOME") ? t("name") : t("title")
                            ]
                          }
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
      title: t("Price"),
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
            getTotalPrice(record?.testType, record?.tests)
          ).toLocaleString("en")}
        </span>
      ),
    },
    {
      title: t("EndPrice"),
      dataIndex: "id",
      key: "id",
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
      title: t("Discount"),
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
      title: t("CreatedAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => (
        <span style={{ color: "#666" }}>
          <span style={{ fontSize: 12 }}>
            {dayjs(createdAt).format("DD/MM/YYYY")}
          </span>{" "}
          {dayjs(createdAt).add(3, "hours").format("hh:mm A")}
        </span>
      ),
    },
    {
      title: t("Status"),
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
            <Button
              onClick={() => handleResults(record)}
              style={{ fontSize: 12 }}
              size="small"
            >
              {t("PrintResults")}
            </Button>
            <Divider type="vertical" />
            <Popover
              onOpenChange={(isOpen) => {
                if (isOpen) setDestPhone(record?.patient?.phone);
                else setIsConfirm(false);
              }}
              content={whatsapContnet(record)}
            >
              <Button
                size="small"
                icon={<WhatsAppOutlined WhatsAppOutlined />}
                loading={msgLoading && record?.patient?.phone === destPhone}
              ></Button>
            </Popover>
            <Button
              size="small"
              disabled={record?.status === t("COMPLETED")}
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            ></Button>
            <Popconfirm
              title={t("DeleteTheRecord")}
              description={t("DeleteThisRecord")}
              onConfirm={() => handleRemove(record.id)}
              okText={t("Yes")}
              cancelText={t("No")}
              placement="leftBottom"
            >
              <Button danger size="small" icon={<DeleteOutlined />}></Button>
            </Popconfirm>
          </Space>
        ),
      }),
    },
  ];
//commit

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
    setTests(tests);
    setPatientID(patient?.id);
    setBirth(dayjs(patient?.birth));
    setName(patient?.name);
    setEmail(patient?.email);
    setPhone(patient?.phone);
    setGender(patient?.gender);
    setTestType(testType);
    setDiscount(discount);
    setIsModal(true);
    setCreatedAt(createdAt);
  };

  useEffect(() => {
    let startDate = filterDate
      ? dayjs(filterDate[0]).startOf("day").toISOString()
      : "";
    let endDate = filterDate
      ? dayjs(filterDate[1]).endOf("day").toISOString()
      : "";

    if (!isReport && isToday) {
      startDate = dayjs().startOf("day").toISOString();
      endDate = dayjs().endOf("day").toISOString();
    } else if (!isReport && !isToday) {
      startDate = "";
      endDate = "";
    }

    send({
      query: "getVisits",
      data: {
        q: querySearch,
        skip: (page - 1) * limit,
        limit,
        startDate,
        endDate,
      },
    }).then((resp) => {
      if (resp.success) {
        setData(resp.data);
        setTotal(resp.total);
      } else {
        console.error("Error retrieving visits:", resp.error);
      }
    });
  }, [page, isReload, querySearch, isToday, filterDate, limit]);

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
        <div className="table-footer app-flex-space">
          <div
            class="pattern-isometric pattern-indigo-400 pattern-bg-white 
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
          />
        </div>
      )}
    />
  );
};

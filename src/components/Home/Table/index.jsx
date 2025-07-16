import {
  ManOutlined,
  WomanOutlined,
  EditOutlined,
  DeleteOutlined,
  WhatsAppOutlined,
  BarcodeOutlined,
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
  Tooltip,
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
  useTrigger,
} from "../../../libs/appStore";
import usePageLimit from "../../../hooks/usePageLimit";
import { useTranslation } from "react-i18next";
import { apiCall } from "../../../libs/api";
import { parseTests } from "../ResultsModal";
import PopOverContent from "../../../screens/SettingScreen/PopOverContent";
import { usePlan } from "../../../hooks/usePlan";
import { useAppTheme } from "../../../hooks/useAppThem";

export const PureTable = ({ isReport = false }) => {
  const { isReload, setIsReload, isOnline } = useAppStore();
  const { canSendWhatsapp, initUser } = usePlan();
  const {
    setIsModal,
    setId,
    setTestType,
    setDiscount,
    setTests,
    setCreatedAt,
    querySearch,
    setIsResultsModal,
    setRecord,
    isToday,
    setPatientRow,
    setDoctorRow,
  } = useHomeStore();
  const { filterDate, visitStatus } = useReportsStore();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [destPhone, setDestPhone] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userType] = useState(
    JSON.parse(localStorage.getItem("lab-user"))?.Plan?.type
  );
  const { flag, setFlag } = useTrigger();

  const limit = usePageLimit();
  const { setIsBarcode } = useHomeStore();
  const { t, i18n } = useTranslation();
  const { appColors } = useAppTheme();

  const direction = i18n.dir();

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

  const handlePrintBarcode = async (record) => {
    setRecord(record);
    setIsBarcode(true);
    setIsResultsModal(true);
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
    setMsgLoading(true);
    if (destPhone !== record?.phone) await updatePatient(record, destPhone);
    let phone = destPhone;
    if (!phoneValidate(phone)) {
      message.error("رقم الهاتف غير صحيح!");
      return;
    } else if (phone[0] === "0") phone = phone.substr(1);

    try {
      let pdf;

      let printResults = () => {
        return new Promise((resolve, reject) => {
          const planType = JSON.parse(localStorage?.getItem("lab-user"))?.Plan
            ?.type;
          let data = {
            patient: record.patient.name,
            age: dayjs().diff(dayjs(record.patient.birth), "y"),
            date: dayjs(record.createdAt).format("YYYY-MM-DD"),
            tests: parseTests(record),
            isHeader: true,
            fontSize: 12,
            isFree: planType === "FREE",
          };

          send({
            query: "print",
            data,
            isView: false,
          }).then(({ err, res, file }) => {
            if (err) {
              console.error("Error generating PDF:", err);
              reject(err);
            }
            if (file) {
              resolve(file);
            } else {
              reject(new Error("No file returned"));
            }
            console.log(err, res, file);
          });
        });
      };

      let handleSubmit = async () => {
        let data = { ...record, status: "COMPLETED", updatedAt: Date.now() };

        send({
          doc: "visits",
          query: "updateVisit",
          data: { ...data },
          id: record?.id,
        }).then(({ err }) => {
          if (err) message.error("Error !");
          else {
            setRecord(null);
            setIsResultsModal(false);
            setIsReload(!isReload);
            setTimeout(async () => {
              try {
                const res = await printResults();
                pdf = new Blob(res.arrayBuffer, { type: "application/pdf" });
                const formData = new FormData();
                formData.append("name", record?.patient?.name);
                formData.append("phone", phone);
                formData.append("file", pdf, "report.pdf");
                const resp = await apiCall({
                  method: "POST",
                  pathname: "/app/whatsapp-message",
                  isFormData: true,
                  data: formData,
                  auth: true,
                });

                if (resp?.ok) {
                  const response = await resp.json();
                  setMsgLoading(false);
                  await initUser();
                  message.success(response?.message);

                  try {
                    if (isOnline && window.gtag) {
                      window.gtag("event", "click", {
                        event_category: "button",
                        event_label: "whatsapp-message-button",
                        value: 1,
                      });
                    }
                  } catch (e) {
                    throw new Error(e.message);
                  }
                } else {
                  message.error(response?.error);
                }
              } catch (error) {
                console.error("Error generating PDF:", error);
                message.error("Error!.");
                setMsgLoading(false);
              }
            }, 100);
          }
        });
      };

      await handleSubmit();
    } catch (error) {
      console.error("Error generating PDF or sending data:", error);
      message.error(t("erroroccurred"));
      setMsgLoading(false);
    }
  };

  const whatsapContnet = (record) => (
    <div div className="whatsap-content">
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
      title: t("Name"),
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space size={0} direction="vertical">
          <b>{record?.patient?.name}</b>
          {record?.doctor && (
            <small className="block -mt-[2px] opacity-60">
              {t("FROM")} {record?.doctor?.name}
            </small>
          )}
        </Space>
      ),
    },
    {
      title: t("Gender"),
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
      title: t("Tests"),
      dataIndex: "tests",
      key: "tests",
      render: (_, record) => {
        let testType = record.testType.replace(/^"|"$/g, "");
        let list = record.tests;
        let numOfView = 2;
        let restCount =
          list.length > numOfView ? list.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {list?.slice(0, numOfView).map((el, index) => (
              <Tag key={`${el.id || ""}-${index}`}>
                {el[testType === "CUSTOME" ? "name" : "title"]}
              </Tag>
            ))}
            {restCount && (
              <Popover
                content={
                  <div style={{ maxWidth: "300" }}>
                    <Space wrap>
                      {list?.map((el, index) => (
                        <Tag key={`${el.id || ""}-${index}`}>
                          {el[testType === "CUSTOME" ? "name" : "title"]}
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
          <span style={{ fontSize: 14 }}>
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
          <Space Space size="small" className="custom-actions">
            <Button
              onClick={() => handleResults(record)}
              style={{ fontSize: 12 }}
              size="small"
            >
              {t("PrintResults")}
            </Button>
            <Tooltip title={t("PrintBarcode")}>
              <Button
                onClick={() => handlePrintBarcode(record)}
                style={{ fontSize: 12 }}
                size="small"
                icon={<BarcodeOutlined />}
                disabled={userType === "FREE"}
              />
            </Tooltip>
            <Divider type="vertical" />
            {
              <Popover
                onOpenChange={(isOpen) => {
                  if (isOpen) setDestPhone(record?.patient?.phone);
                  else setIsConfirm(false);
                }}
                placement={direction === "ltr" ? "bottomRight" : "bottomLeft"}
                content={
                  userType === "FREE" ? (
                    <PopOverContent
                      website={"https://www.puretik.com/ar"}
                      email={"puretik@gmail.com"}
                      phone={"07710553120"}
                    />
                  ) : (
                    whatsapContnet(record)
                  )
                }
                open={
                  userType === "FREE"
                    ? undefined
                    : record?.status == "PENDING"
                    ? false
                    : undefined
                }
              >
                <Button
                  size="small"
                  className=" sticky"
                  icon={<WhatsAppOutlined />}
                  loading={msgLoading}
                  disabled={
                    record?.status == "PENDING" ||
                    userType === "FREE" ||
                    !canSendWhatsapp()
                  }
                />
              </Popover>
            }
            <Button
              size="small"
              disabled={record?.status === "COMPLETED"}
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
          message.success(t("Visitdeletedsuccessfully"));
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
    doctor,
    testType,
    discount,
    tests,
    createdAt,
  }) => {
    patient.birth = dayjs(patient.birth);
    setPatientRow(patient);
    setDoctorRow(doctor);
    setId(id);
    setTests(tests);
    setTestType(testType);
    setDiscount(discount);
    setIsModal(true);
    setCreatedAt(createdAt);
  };

  const handelOpenModal = (data) => {
    const numberValue = Number(querySearch);
    let isBarcode = !isNaN(numberValue) && querySearch.length === 6;
    if (isBarcode && data.length === 1) {
      setRecord(data[0]);
      setIsResultsModal(true);
    }
  };

  useEffect(() => {
    setLoading(true);
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
        status: visitStatus,
      },
    }).then((resp) => {
      if (resp.success) {
        setData(resp.data);
        setTotal(resp.total);
        handelOpenModal(resp.data);
      } else {
        console.error("Error retrieving visits:", resp.error);
      }
      setLoading(false);
      setFlag(false);
    });
  }, [
    page,
    isReload,
    querySearch,
    isToday,
    filterDate,
    visitStatus,
    limit,
    flag,
  ]);

  return (
    <Table
      style={{
        marginTop: 16,
        border: `1px solid ${appColors.colorBorder}`,
        borderRadius: 10,
        overflow: "hidden",
      }}
      columns={columns}
      rowKey={(row) => row.id}
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

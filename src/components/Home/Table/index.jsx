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
import { apiCall } from "../../../libs/api";
import { parseTests } from "../ResultsModal";
import PopOverContent from "../../../screens/SettingScreen/PopOverContent";

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
    record
  } = useHomeStore();
  const { filterDate } = useReportsStore();

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [msgLoading, setMsgLoading] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [destPhone, setDestPhone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [labFeature, setLabFeature] = useState(
    localStorage.getItem('lab-feature') === "null" ? null : localStorage.getItem('lab-feature')
  );
  const [userType, setUserType] = useState(JSON.parse(localStorage.getItem('lab-user')).type);

  const limit = usePageLimit();
  const { setTableData } = useHomeStore();
  const { t, i18n } = useTranslation();

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

  console.log(data, 'data');


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

    try {
      let pdf;

      let printResults = () => {
        return new Promise((resolve, reject) => {
          let data = {
            patient: record.patient.name,
            age: dayjs().diff(dayjs(record.patient.birth), "y"),
            date: dayjs(record.createdAt).format("YYYY-MM-DD"),
            tests: parseTests(record),
            isHeader: true,
            fontSize: 12,
          };
          send({
            query: "print",
            data,
            isView: false,
          }).then(({ err, res, file }) => {
            if (err) {
              reject(err);
            }
            if (file) {
              resolve(file);
            }
            console.log(err, res, file);
          })
        });
      }

      let handleSubmit = async () => {
        let data = { ...record, status: "COMPLETED", updatedAt: Date.now() };

        send({
          doc: "visits",
          query: "updateVisit",
          data: { ...data },
          id: record?.id
        }).then(({ err }) => {
          if (err) message.error("Error !");
          else {
            message.success(t("savesuccess"));
            setRecord(null);
            setIsResultsModal(false);
            setIsReload(!isReload);
            setTimeout(async () => {
              try {
                const res = await printResults();
                pdf = new Blob(res.arrayBuffer, { type: "application/pdf" });
                console.log(res, 'ressss');

                // Continue with sending the PDF to the server...

                const formData = new FormData();
                formData.append('name', record?.patient?.name);
                formData.append('phone', phone);
                formData.append('lab', JSON.parse(localStorage?.getItem("lab-user"))?.labName || "");
                formData.append('file', pdf, 'report.pdf');
                formData.append('senderPhone', JSON.parse(localStorage?.getItem("lab-user"))?.phone || "");
                const resp = await apiCall({
                  method: 'POST',
                  pathname: '/send/whatsapp-message',
                  isFormData: true,
                  data: formData,
                });
                const response = await resp.json();

                console.log(response);

                if (response?.message === t("Messagesentsuccess")) {
                  message.success(t("SendSuccess"));
                } else {
                  message.error(t("Error"));
                }
              } catch (error) {
                console.error("Error generating PDF:", error);
                message.error(t("ErrorGenerate"));
              }
            }, 1000);
          }
        });
      };

      await handleSubmit()
    } catch (error) {
      console.error("Error generating PDF or sending data:", error);
      message.error(t("erroroccurred"));
    } finally {
      setMsgLoading(false);
    }
  };

  const whatsapContnet = (record) => (
    <div div className="whatsap-content" >
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
        let testType = record.testType.replace(/^"|"$/g, "");
        let list = record.tests;
        let numOfView = 2;
        let restCount =
          list.length > numOfView ? list.length - numOfView : null;
        return (
          <Space wrap size={[0, "small"]}>
            {list?.slice(0, numOfView).map((el) => (
              <Tag key={el.id}>
                {el[testType === "CUSTOME" ? "name" : "title"]}
              </Tag>
            ))}
            {restCount && (
              <Popover
                content={
                  <div style={{ maxWidth: "300" }}>
                    <Space wrap>
                      {list?.map((el) => (
                        <Tag key={el.id}>
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
          <Space Space size="small" className="custom-actions" >
            <Button
              onClick={() => handleResults(record)}
              style={{ fontSize: 12 }}
              size="small"
            >
              {t("PrintResults")}
            </Button>
            <Divider type="vertical" />
            {
              <Popover
                onOpenChange={(isOpen) => {
                  if (isOpen) setDestPhone(record?.patient?.phone);
                  else setIsConfirm(false);
                }}
                placement={direction === "ltr" ? "bottomRight" : "bottomLeft"}
                content={
                  userType === "trial" || labFeature === null ? (
                    <PopOverContent
                      website={"https://www.puretik.com/ar"}
                      email={"puretik@gmail.com"}
                      phone={"07710553120"}
                    />
                  ) : (
                    whatsapContnet(record)
                  )
                }
                open={userType === "trial" ? undefined : (record?.status == "PENDING") ? false : undefined}
              >
                <Button
                  size="small"
                  className=" sticky"
                  icon={<WhatsAppOutlined />}
                  loading={msgLoading && record?.patient?.phone === destPhone}
                  disabled={labFeature === null || record?.status == "PENDING" || userType === "trial"}
                />
              </Popover>
            }
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
      },
    }).then((resp) => {
      if (resp.success) {
        setData(resp.data);
        setTotal(resp.total);
        // message.success(t("Visitsretrievedsuccessfully"));
      } else {
        console.error("Error retrieving visits:", resp.error);

      }
      setLoading(false);
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
      loading={loading}
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
            showSizeChanger={false}
          />
        </div>
      )}
    />
  );
};

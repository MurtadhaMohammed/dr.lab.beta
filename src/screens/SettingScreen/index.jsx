import React, { useEffect, useMemo, useState } from "react";
import "./style.css";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Popconfirm,
  Popover,
  Row,
  Select,
  Space,
  Switch,
  Tag,
} from "antd";
import { PhoneOutlined, UserOutlined, DownloadOutlined , ExportOutlined , ImportOutlined } from "@ant-design/icons";
import fileDialog from "file-dialog";
import { send } from "../../control/renderer";
import { useAppStore, useLanguage ,useWhatsappCountStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import PopOverContent from "./PopOverContent";
import { URL } from "../../libs/api";
import PrinterSelector from './PrinterSelector';

const SettingsScreen = () => {
  const [imagePath, setImagePath] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signoutLoading, setSignoutLoading] = useState(false);
  const [remainingDays, setRemainingDays] = useState(null);
  const { lang, setLang } = useLanguage();
  const { user, setPrintFontSize, printFontSize, setIsLogin } = useAppStore();
  const { whatsappCount , setWhatsappCount } = useWhatsappCountStore();
  const [form] = Form.useForm();
  const [expireData, _] = useState({
    register: localStorage.getItem("lab-created"),
    expire: localStorage.getItem("lab-exp"),
  });
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  const { t } = useTranslation();

  const limits = {
    basic: 50,
    premium: 1000
  }
  const labUser = JSON.parse(localStorage.getItem("lab-user"));
  const userType = labUser?.type;

  // **New State for Selected Printer**
  const [selectedPrinter, setSelectedPrinter] = useState(localStorage.getItem('selectedPrinter') || '');

  async function fetchImagePath() {
    setImagePath(null);
    try {
      const response = await fetch("http://localhost:3009/head.png");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const imageURL = response.url;
      setImagePath(imageURL);
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  }

  const handleWhatsappCount = async (labUserId) => {
    const url = `${URL}/send/whatsapp-count/${labUserId}`;
    try {
      const response = await fetch(url);
      const text = await response.text();

      try {
        const data = JSON.parse(text);
        console.log("Parsed Data:", data);
        const newCount = { sent: data.count };
        setWhatsappCount(newCount);
        localStorage.setItem('whatsappCount', JSON.stringify(newCount));
      } catch (error) {
        console.error("Error parsing JSON:", error);
        setError("Error parsing response data.");
      }
    } catch (error) {
      console.error("Error fetching WhatsApp count:", error);
      setError("Error fetching WhatsApp count.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const storedCount = localStorage.getItem('whatsappCount');
    console.log(storedCount);
    if (storedCount) {
      try {
        const parsedCount = JSON.parse(storedCount);
        setWhatsappCount(parsedCount);
      } catch (error) {
        console.error("Error parsing stored count:", error);
        setError("Error loading stored data.");

      }
    } else {
      const labUserData = localStorage.getItem('lab-user');

      if (labUserData) {
        try {
          const parsedData = JSON.parse(labUserData);
          const labUserId = parsedData.id;

          if (labUserId) {
            handleWhatsappCount(labUserId);
          } else {
            console.error("No client ID found in local storage data.");
            setError("No client ID found.");
          }
        } catch (error) {
          console.error("Error parsing local storage data:", error);
          setError("Error parsing local storage data.");
        }
      } else {
        console.error("No lab-user data found in local storage.");
        setError("No lab-user data found.");
      }
    }
  }, []);

  useEffect(() => {
    let limit = 0;
    if (userType === 'basic') {
      limit = 50;
    } else if (userType === 'premium') {
      limit = 1000;
    }
    setWhatsappCount({ limit });
  }, [userType, setWhatsappCount]);
  
  useEffect(() => {
    fetchImagePath();
  }, []);

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
    }
  }, [user, form]);

  const signout = async () => {
    setSignoutLoading(true);
    try {
      let serial = localStorage.getItem("lab-serial");
      console.log("Serial:", serial);
      const resp = await fetch(`${URL}/app/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serial }),
      });
      if (resp.status === 200) {
        setSignoutLoading(false);
        localStorage.clear();
        setIsLogin(false);
        navigate(-1, { replace: true });
      } else message.error(t("Serialnotfound"));
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setSignoutLoading(false);
    }
  };

  useEffect(() => {
    calculateRemainingDays();
  }, []);

  const calculateRemainingDays = () => {
    const labCreated = localStorage.getItem("lab-created");
    const labExp = parseInt(localStorage.getItem("lab-exp"));

    if (labCreated && labExp) {
      const createdDate = dayjs(labCreated);
      const today = dayjs();
      const dayPassed = today.diff(createdDate, "day");
      const remaining = labExp - dayPassed;
      setRemainingDays(remaining > 0 ? remaining : 0);
    }
  };

  const handleSizeChange = (val) => {
    localStorage.setItem("lab-print-size", val);
    setPrintFontSize(val);
  };


  const handelCancel = () => {
    form.setFieldsValue(user);
    setIsUpdate(false);
  };

  const onFieldsChange = (field) => {
    let name = field[0].name[0];
    let value = field[0].value;
    if (value === "") value = null;
    if (value !== user[name]) setIsUpdate(true);
    else setIsUpdate(false);
  };

  const handleChangeFile = async () => {
    fileDialog().then(async (file) => {
      send({
        query: "saveHeadImage",
        file: file[0]?.path,
      }).then((resp) => {
        if (resp.success) {
          fetchImagePath();
        } else {
          console.error("Error retrieving visits:", resp.error);
        }
      });
    });
  };

  const handleUpdateClient = async (values) => {
    setLoading(true);
    send({ query: "getUUID" }).then(async ({ UUID }) => {
      try {
        const resp = await fetch(`${URL}/app/update-client`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            device: UUID,
          }),
        });


        if (resp.ok) {
          let data = await resp.json();
          localStorage.setItem("lab-user", JSON.stringify(data.updatedClient));
          message.success(t("UpdateSuccess"));
          setIsUpdate(false);
        } else {
          let errorData = await resp.json();
          console.error("Update failed:", errorData);
          message.error(
            `Update failed: ${errorData.message || "Unknown error"}`
          );
        }
      } catch (error) {
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleLang = (checked) => {
    if (checked != undefined) {
      const newLanguage = checked ? "ar" : "en";
      i18n.changeLanguage(newLanguage);
      setLang(newLanguage);
      document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    } else {
      i18n.changeLanguage(lang);
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  };

  useEffect(() => {
    handleLang();
  }, []);

  const handleWhatsUpExpireation = (expire) => {
    if (expire > 7) {
      return {
        status: t("online"),
        textStyle: "text-[#14AE5C] inter font-bold text-sm leading-[16.94px]",
        descStyle: "hidden",
      };
    } else if (expire > 0 && expire <= 7) {
      return {
        status: t("online"),
        textStyle: "text-[#F68A06] inter font-bold text-sm leading-[16.94px]",
        descStyle: "bg-[#F187060A] border-[#BF6A0224] text-[#F68A06]",
        description: t("nearingEndDescription"),
      };
    } else if (expire === 0) {
      return {
        status: t("Disabled"),
        textStyle: "text-[#FF0000] inter font-bold text-sm leading-[16.94px]",
        descStyle: "bg-[#FFEDEC] border-[#FFB9B8] text-[#FF0000]",
        description: t("disabledDescription"),
      };
    } else {
      return {
        status: t("UPGRADE"),
        textStyle: "text-[#0000FF] text-sm font-bold inter leading-[16.94px]",
        descStyle: "bg-[#F6F6F6] border-[#EEEEEE] text-black",
        description: t("subscribeDescription"),
      };
    }
  };

  const whatsAppStatus = useMemo(
    () => handleWhatsUpExpireation(),
    [remainingDays, lang]
  ); // pass the whatsapp subscription days left as an argumnet to handleWhatsUpExpireation function.


  const handleExportDatabase = async () => {
    setExportLoading(true); // Start loading
    const res = await send({ query: "exportDatabaseFile" });
    if (res.success) {
      message.success(t("DatabaseExportedSuccessfully"));
    } else {
      message.error(t("ErrorExportingDatabase"));
      console.error("Error exporting :", res.error);
    }
    setExportLoading(false); // Stop loading
  }

  const handleImportDatabase = async () => {
    setImportLoading(true); // Start loading
    const res = await send({ query: "ImportDatabaseFile"});
    console.log(res)
    if (res.success) {
      message.success(t("importSuccess"));
    } else {
      message.error(t("importError"));
    }
    setImportLoading(false); // Stop loading
  }
  
  // **Callback to handle printer selection**
  const handlePrinterSelect = (printer) => {
    setSelectedPrinter(printer);
  };

  return (
    <div className="settings-page pb-[60px] page">
      <div className="border-none  p-[2%]">
        <section className="flex items-center justify-between w-full mb-[34px]">
          <div className="flex items-center gap-4">
            <Avatar size={"large"} icon={<UserOutlined />} />
            <div>
              <b className="text-[16px]">{user?.name}</b>
              <span className="text-[14px] text-[#A5A5A5] block">
                {user?.phone}
              </span>
            </div>
          </div>

          <Space size={28}>
            <Space>
              <span className="m-0 p-0">{t("SystemLanguage")} </span>
              <Switch
                className="switchBtn"
                checkedChildren="عربي"
                unCheckedChildren="en"
                checked={lang === "ar"}
                onChange={handleLang}
                style={{ width: 60 }}
              />
            </Space>
            <Divider type="vertical" />
            <Popconfirm
              placement="rightBottom"
              onConfirm={signout}
              title={t("SignoutConfirm")}
              description={t("SignOutFormThisApp")}
            >
              <Button loading={signoutLoading} danger>
                {t("SignOut")}
              </Button>
            </Popconfirm>
          </Space>
        </section>

        <section>
          <p className="pl-[4px] opacity-60">{t("AccountInfo")}</p>
          <Card className="mt-[6px]">
            <Form
              form={form}
              onFinish={handleUpdateClient}
              onFieldsChange={onFieldsChange}
              layout="vertical"
              autoComplete="off"
            >
              <Row gutter={[20, 0]}>
                <Col span={6}>
                  <Form.Item
                    label={t("FullName")}
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: t("PleaseInputYourName"),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item
                    label={t("PhoneNumber")}
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: t("PleaseInputYourPhone"),
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={t("Email")} name="email">
                    <Input type="email" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[20, 0]}>
                <Col span={6}>
                  <Form.Item label={t("Address")} name="address">
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item label={t("LabName")} name="labName">
                    <Input />
                  </Form.Item>
                </Col>

                {(isUpdate || loading) && (
                  <Col span={6}>
                    <Space>
                      <Form.Item label=" ">
                        <Button
                          loading={loading}
                          type="primary"
                          htmlType={t("submit")}
                        >
                          {t("SaveChanges")}
                        </Button>
                      </Form.Item>

                      <Button disabled={loading} onClick={handelCancel}>
                        {t("Cancel")}
                      </Button>
                    </Space>
                  </Col>
                )}
              </Row>
            </Form>
          </Card>
        </section>
        <section className=" grid grid-cols-2 gap-[20px] mt-[24px]">
          <div>
            <p className="pl-[4px] opacity-60">{t("PDFSetting")}</p>
            <Card className="mt-[6px]">
              <div className="flex justify-between items-center">
                <b className="text-[14px]">{t("ImageCover")}</b>
                <Button type="link" onClick={handleChangeFile}>
                  {t("ChangeImage")}
                </Button>
              </div>
              <div className="w-full border border-[#eee]  rounded-md overflow-hidden bg-[#f6f6f6]">
                {imagePath && <img className="w-full" src={imagePath} />}
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <b className="text-[14px]">{t("FontSize")}</b>
                <Select
                  value={printFontSize}
                  variant="borderless"
                  onChange={handleSizeChange}
                  popupMatchSelectWidth={false}
                  style={{ width: 100, textAlign: "center" }}
                >
                  <Select.Option value={12}>Small</Select.Option>
                  <Select.Option value={14}>Medium</Select.Option>
                  <Select.Option value={16}>Large</Select.Option>
                </Select>
              </div>
            </Card>
          </div>
          <div>
            <p className="pl-[4px] opacity-60">{t("SubscriptionInfo")}</p>
            <Card className="mt-[6px] min-h-[212px]">
              <div className="flex flex-col w-full gap-[10px]">
                <div
                  className={`${remainingDays < 7
                    ? "bg-[#F187060A] border-[#BF6A0224]"
                    : "bg-[#C8E6C942] border-[#4CAF50]"
                    }  w-full flex justify-between border-[1px] px-3 py-2 rounded-lg inters leading-[19.36px]`}
                >
                  <p className=" font-normal">{t("SerialNumber")}</p>
                  <p className=" font-bold">
                    {localStorage.getItem("lab-serial") || "10992909"}
                  </p>
                </div>

                {/* {userType === "paid" && remainingDays < 4 ? (
                  <p className="px-1 text-[#F68A06] font-normal text-sm leading-[16.94px]">
                    {t("supportPaymentReminder")}
                  </p>
                ) : null} */}
                <div className="w-full flex justify-between inter px-1 leading-[16.94px]">
                  <p>{t("startedAt")}</p>
                  <p className="text-[#A5A5A5] font-normal text-sm">
                    {expireData.register
                      ? dayjs(expireData.register).format("YYYY MMM, DD")
                      : "2024 Aug, 11"}
                  </p>
                </div>

                <div className="w-full flex justify-between inter px-1 leading-[16.94px]">
                  <p className=" font-normal text-sm">{t("expiredAt")}</p>
                  <p className=" text-[#A5A5A5] font-normal text-sm">
                    {expireData.expire
                      ? dayjs()
                        .add(expireData.expire, "day")
                        .format("YYYY MMM, DD")
                      : "2024 Aug, 11"}
                  </p>
                </div>

                <div className="w-full flex justify-between inter px-1 leading-[16.94px]">
                  <p className=" font-normal text-sm">{t("daysLeft")}</p>
                  <p className=" text-[#A5A5A5] font-normal text-sm">{`${remainingDays || 120
                    } ${t("day")}`}</p>
                </div>
                <div className="w-full flex justify-between inter px-1">
                  <p className=" font-normal text-sm">{t("whatsappLimit")}</p>

                  <p className=" text-[#A5A5A5] font-normal text-sm">
                    {`${whatsappCount.sent}/${whatsappCount.limit}`}
                  </p>
                </div>
                <div className="w-full flex justify-between inter px-1">
                  <p className=" font-normal text-sm">{t("accountTypeLeft")}</p>

                  <Tag color="magenta-inverse" className="m-0">
                    {String(userType).toLocaleUpperCase()}
                  </Tag>
                </div>

                {/* <div className="px-1 h-full flex flex-col gap-2">
                  <Divider className="!m-0 px-1" />
                  <div className="w-full flex justify-between inter leading-[16.94px] my-1 -mb-1">
                    <p className=" font-normal">{t("whatsappIntegration")}</p>
                    <Popover
                      trigger="hover"
                      content={
                        <PopOverContent
                          website={"https://www.puretik.com/ar"}
                          email={"info@puretik.com"}
                          phone={"07710553120"}
                        />
                      }
                    >
                      <p
                        className={`${whatsAppStatus.textStyle} font-bold text-sm`}
                      >
                        {whatsAppStatus.status}
                      </p>
                    </Popover>
                  </div>

                  <p
                    className={`${whatsAppStatus.descStyle} p-2 border-[1px] rounded-lg !mt-2`}
                  >
                    {whatsAppStatus.description}
                  </p>
                </div> */}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-[20px] mt-[24px]">
          <div>
            <p className="pl-[4px] opacity-60">{t("DatabaseManagement")}</p>
            <Card className="mt-[6px]">
              <div className="flex justify-between items-center">
                <b className="text-[14px]">{t("ExportDatabase")}</b>
                <Button 
                  type="primary" 
                  icon={<ExportOutlined />} 
                  onClick={handleExportDatabase}
                  loading={exportLoading}
                >
                  {t("ExportToDesktop")}
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t("ExportDatabaseDescription")}
              </p>
            </Card>
          </div>
          <div>
            <Card className="mt-[27px]">
              <div className="flex justify-between items-center">
                <b className="text-[14px]">{t("ImportDatabase")}</b>
                <Button 
                  type="primary" 
                  icon={<ImportOutlined />} 
                  onClick={handleImportDatabase}
                  loading={importLoading} // Changed to importLoading
                >
                  {t("ImportToSystem")}
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t("ImportDatabaseDescription")}
              </p>
            </Card>
            <p className="pl-[4px]  opacity-60">{t('printer')}</p>
            <Card className="mt-[6px] ">
              <div className="flex justify-between items-center">
                {/* **Pass the callback to PrinterSelector** */}
                <PrinterSelector onPrinterSelect={handlePrinterSelect} />
                <p className="py-2">{t('printer')} : {selectedPrinter}</p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};
export default SettingsScreen;
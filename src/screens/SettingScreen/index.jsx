import React, { useEffect, useState } from "react";
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
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
// import headImage from "../../../image.png";
import fileDialog from "file-dialog";
import { send } from "../../control/renderer";
import { useAppStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import dayjs from "dayjs";

const SettingsScreen = () => {
  const [imagePath, setImagePath] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signoutLoading, setSignoutLoading] = useState(false);
  const [remainingDays, setRemainingDays] = useState(null);
  const [language, setLanguage] = useState("en");
  const { user, setPrintFontSize, printFontSize, setIsLogin } = useAppStore();
  const [form] = Form.useForm();

  const { t } = useTranslation();

  async function fetchImagePath() {
    setImagePath(null);
    try {
      const response = await fetch("http://localhost:3001/head.png");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const imageURL = response.url;
      setImagePath(imageURL);
    } catch (error) {
      console.error("Failed to load image:", error);
    }
  }
  useEffect(() => {
    fetchImagePath();
  }, []);

  useEffect(() => {
    form.setFieldsValue(user);
  }, [user]);

  const signout = async () => {
    setSignoutLoading(true);
    try {
      let serialId = parseInt(localStorage.getItem("lab-serial-id"));
      const resp = await fetch(
        `https://dr-lab-apiv2.onrender.com/api/client/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serialId }),
        }
      );
      if (resp.status === 200) {
        setSignoutLoading(false);
        localStorage.removeItem("lab-exp");
        localStorage.removeItem("lab-serial-id");
        localStorage.removeItem("lab-user");
        setIsLogin(false);
      } else message.error("Serial not found!");
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
      setRemainingDays(remaining > 0 ? remaining : 0)

    }
  }

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
        const resp = await fetch(
          "https://dr-lab-apiv2.onrender.com/api/client/update-client",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...values,
              device: UUID,
            }),
          }
        );

        if (resp.status === 200) {
          let data = await resp.json();
          setLoading(false);
          localStorage.setItem("lab-user", JSON.stringify(data));
          message.success("Update Successfully.");
          setIsUpdate(false);
        } else message.error("Update failed!");
      } catch (error) {
        console.log(error);
        message.error(error.message);
        setLoading(false);
      }
    });
  };

  const handleLang = (checked) => {
    const newLanguage = checked ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
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
                checked={language === "ar"}
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
                <Col span={8}>
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
                        message: t("PleaseInputYourPhone!"),
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
                <Col span={7}>
                  <Form.Item label={t("Address")} name="address">
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
                >
                  <Select.Option value={14}>{t("Medium")}</Select.Option>
                  <Select.Option value={12}>{t("Small")}</Select.Option>
                  <Select.Option value={16}>{t("Large")}</Select.Option>
                </Select>
              </div>
            </Card>
          </div>
          <div>
            <p className="pl-[4px] opacity-60">{t("SubscriptionInfo")}</p>
            <Card className="mt-[6px]">
              <div>
                <p className="pl-[4px] opacity-60">{t("LabAccount")}</p>

                <div className="flex justify-between items-center">
                  <b className="text-[14px]">{t("RemainingDaysInLabAccount")}</b>
                  <span>{remainingDays !== null ? `${remainingDays} ${t("Days")}` : t("Loading")}</span>
                </div>

              </div>
              <b className="text-[14px]">{t("CurrentPlan")}</b>
              <div className="rounded-[4px] bg-[#F6F6F6] px-[8px] py-[4px] mt-[6px]">
                {t("FreeTrail")} -{" "}
                <span className="text-[12px] text-[#a5a5a5]">
                  {t("expierd")}
                </span>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsScreen;

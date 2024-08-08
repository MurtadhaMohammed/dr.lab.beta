import {
  Avatar,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Space,
  Typography,
  message,
  Switch,
} from "antd";
import "./style.css";
import { useEffect, useState } from "react";
import { useAppStore } from "../../libs/appStore";
import Logo from "../../assets/logo2.png";
import { send } from "../../control/renderer";
import background from "../../assets/login.svg";
import { apiCall } from "../../libs/api";
import BackIcon from "./BackIcon";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const LoginScreen = () => {
  const [key, setKey] = useState("");
  const [phone, setPhone] = useState("");
  const { setIsLogin } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [UUID, setUUID] = useState(null);
  const [isForm, setIsForm] = useState(false);
  const [language, setLanguage] = useState("en");
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const getUUID = async () => {
    try {
      const resp = await send({ query: "getUUID" });
      console.log("Full response:", resp);
      if (resp && resp.UUID) {
        setUUID(resp.UUID);
        console.log("Updated UUID state:", resp.UUID);
      } else {
        console.error("UUID is not available in the response");
      }
    } catch (error) {
      console.error("Error retrieving UUID:", error);
    }
  };

  useEffect(() => {
    getUUID();
  }, []);


  const getPlatform = () => {
    const { userAgent } = navigator;
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "MacOS";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown";
  };

  const checkSerial = async () => {
    setLoading(true);
    try {
      const resp = await apiCall({
        method: "POST",
        pathname: "/app/check-client",
        isFormData: false,
        data: {
          serial: key,
          device: UUID,
          platform: getPlatform(),
        },
      });

      if (resp.success) {
        let data = resp.json();
        const { client, serial } = data;
        localStorage.setItem("lab-user", JSON.stringify(client));
        localStorage.setItem("lab-serial-id", serial?.id);
        localStorage.setItem("lab-exp", serial.exp);
        localStorage.setItem("lab-created", serial.startAt);
        setIsLogin(true);
      } else {
        setIsForm(false);
        let data = resp.json();
        message.error(data.message || "Serial not found!");
      }
    } catch (error) {
      console.log(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    // if (!UUID) {
    //   message.error("Error !");
    //   return;
    // }
    setLoading(true);
    try {
      const formData = form.getFieldsValue();
      const resp = await apiCall({
        method: "POST",
        pathname: "/app/register",
        data: {
          name: formData.name,
          labName: formData.labName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          platform: getPlatform(),
          device: UUID,
        },
        // auth: false,
      });

      if (resp.success) {
        let data = resp.json();
        const { client, serial } = data;
        localStorage.setItem("lab-user", JSON.stringify(client));
        localStorage.setItem("lab-serial-id", serial?.id);
        localStorage.setItem("lab-exp", serial.exp);
        localStorage.setItem("lab-created", serial.startAt);
        setIsLogin(true);
      } else {
        setIsForm(false);
        let data = resp.json();
        message.error(data.message || "Serial not found!");
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsForm(false);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("app-language");
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === "ar" ? "ltr" : "ltr";
    }
  }, []);

  const handleLang = (checked) => {
    const newLanguage = checked ? "ar" : "en";
    i18n.changeLanguage(newLanguage);
    setLanguage(newLanguage);
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr";
    localStorage.setItem("app-language", newLanguage);
  };

  return (
    <div
      className="h-screen flex items-center justify-center bg-gradient-to-r from-violet-600 to-[#0000ff]"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isForm ? (
        <Card className="w-[400px]" title={<BackIcon onClose={handleClose} />}>
          <Form
            form={form}
            onFinish={register}
            initialValues={{
              phone,
            }}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              label={t("FullName")}
              name="name"
              className="h-16 mb-5"
              rules={[
                {
                  required: true,
                  message: t("PleaseInputyourName"),
                },
              ]}
            >
              <Input placeholder={t("AliSalim")} className=" h-[40px] mt-0.5" />
            </Form.Item>
            <Form.Item
              label={t("LabName")}
              name="labName"
              className="h-16 mb-5"
              rules={[
                {
                  required: true,
                  message: t("PleaseInputYourLabName"),
                },
              ]}
            >
              <Input placeholder={t("AliSalim")} className=" h-[40px] p-2" />
            </Form.Item>

            <Form.Item
              label={t("PhoneNumber")}
              name="phone"
              className="h-16 mb-5"
              rules={[
                {
                  required: true,
                  message: t("PleaseInputYourPhone"),
                },
              ]}
            >
              <Input placeholder="07xxxxxxxx" className=" h-[40px] p-2" />
            </Form.Item>

            <Form.Item label={t("Email")} name="email" className="h-16 mb-5">
              <Input
                type="email"
                placeholder="example@email.com"
                className=" h-[40px] p-2"
              />
            </Form.Item>

            <Form.Item
              label={t("Address")}
              name="address"
              className="h-16 mb-8"
            >
              <Input placeholder="Iraq - Baghdad" className=" h-[40px] p-2" />
            </Form.Item>

            <Button loading={loading} type="primary" htmlType="submit">
              {t("Continue")}
            </Button>
          </Form>
        </Card>
      ) : (
        <Card
          className=" -mt-[80px]"
          styles={{
            header: {
              padding: 0,
              overflow: "hidden",
            },
            body: {
              padding: 32,
            },
          }}
        >
          <Space direction="vertical" size={32} className="w-96 h-full">
            <div className="w-full flex flex-col items-center gap-8">
              <img src={Logo} className="w-[198px]" alt="Dr.Lab" />

              <div className="w-full">
                <h1 className=" text-[32px] text-center leading-[43.57px] !font-light mb-2 inter">
                  {t("Try")} <span className=" font-bold">{t("Drlab")}</span> {t("businessplan")}
                </h1>
              </div>
            </div>

            <div className="flex flex-col gap-7">
              <Input
                size="large"
                style={{ width: "100%", textAlign: "center" }}
                className="h-12"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={t("SerialNumber")}
              />

              <Button
                disabled={!key || key.length < 8}
                loading={loading}
                type="primary"
                block
                className="h-12"
                onClick={checkSerial}
              >
                {t("Login")}
              </Button>

              <div className="h-full flex flex-col gap-4">
                <div className="w-full border-[0.5px] relative">
                  <p className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 font-semibold text-base text-[#0000009d]">
                    {t("or")}
                  </p>
                </div>
                <p
                  className="text-[#000000a1] text-center text-base font-semibold leading-[29.05px] inter"
                  onClick={() => setIsForm(true)}
                >
                  {t("clickHereToGetA")}
                  <span className="text-[#3853A4] hover:cursor-pointer hover:text-[#0442ff] inter font-bold">
                    {t("FreeTrial")}
                  </span>
                </p>
                <Space>
                  <Switch
                    className="switchBtn"
                    checkedChildren="عربي"
                    unCheckedChildren="en"
                    checked={language === "ar"}
                    onChange={handleLang}
                    style={{ width: 60 }}
                  />
                </Space>
              </div>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default LoginScreen;

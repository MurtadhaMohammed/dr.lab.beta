import { Button, Card, Form, Input, Space, message, Switch } from "antd";
import "./style.css";
import { useEffect, useState } from "react";
import { useAppStore, useLanguage } from "../../libs/appStore";
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
  const { lang, setLang } = useLanguage();
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [disable, setDisable] = useState(false);
  const direction = i18n.dir();

  const getUUID = () => {
    send({ query: "getUUID" }).then((resp) => {
      setUUID(resp.UUID);
    });
  };

  useEffect(() => {
    setTimeout(() => {
      getUUID();
    }, 500);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDisable(true);
        const resp = await fetch("https://dr-lab-apiv2.onrender.com/");

        if (resp.ok) {
          setDisable(false);
        }
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
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

      console.log(resp, "resp");

      if (resp.ok) {
        const data = await resp.json();

        const { client, updatedSerial } = data;

        if (updatedSerial && updatedSerial.exp) {
          localStorage.setItem("lab-user", JSON.stringify(client));
          localStorage.setItem("lab-serial-id", updatedSerial?.id);
          localStorage.setItem("lab-exp", updatedSerial.exp);
          localStorage.setItem("lab-created", updatedSerial.startAt);
          localStorage.setItem("lab-serial", updatedSerial.serial);
          localStorage.setItem(
            "lab-feature",
            updatedSerial.feature
              ? updatedSerial.feature
                  .map((v) => {
                    if (v.name === "whatsapp") return v.name;
                  })
                  .filter(Boolean)
              : ["null"]
          );

          setIsLogin(true);
        } else {
          throw new Error("Serial data is missing or incomplete");
        }
      } else {
        const data = await resp.json();
        message.error(data.message || t("Serialnotfound"));
      }
    } catch (error) {
      if (error && error.message) {
        message.error(error.message);
      } else {
        message.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!UUID) {
      message.error(t("Error"));
      return;
    }

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
          device: UUID,
          platform: getPlatform(),
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        const { client, serial } = data;

        if (serial && serial.exp && serial.startAt) {
          localStorage.setItem("lab-user", JSON.stringify(client));
          localStorage.setItem("lab-serial-id", serial.id);
          localStorage.setItem("lab-exp", serial.exp);
          localStorage.setItem("lab-created", serial.startAt);
          localStorage.setItem("lab-serial", serial.serial);
          setIsLogin(true);
          setIsForm(false);
        } else {
          throw new Error("Serial data is missing or incomplete");
        }
      } else {
        const errorData = await resp.json();
        message.error(errorData.message || t("Serialnotfound"));
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsForm(false);
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

  return (
    <div
      className="h-screen flex items-center justify-center bg-gradient-to-r from-violet-600 to-[#ff0000]"
      style={{
        backgroundImage: `url(${background})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {isForm ? (
        <Card
          className="w-[400px]"
          title={<BackIcon className="cursor-pointer" onClose={handleClose} />}
        >
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
              className="h-16 mb-7"
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
              className="h-16 mb-7"
              rules={[
                {
                  required: true,
                  message: t("PleaseInputYourLabName"),
                },
              ]}
            >
              <Input
                placeholder={t("labNameexample")}
                className=" h-[40px] p-2"
              />
            </Form.Item>

            <Form.Item
              label={t("PhoneNumber")}
              name="phone"
              className="h-16 mb-7"
              rules={[
                {
                  required: true,
                  message: t("PleaseInputYourPhone"),
                },
                {
                  pattern: /^07\d{9}$/,
                  message: t("InvalidPhoneNumber"),
                },
              ]}
            >
              <Input placeholder="07xxxxxxxxx" className=" h-[40px] p-2" />
            </Form.Item>

            <Form.Item
              label={t("Email")}
              name="email"
              className="h-16 mb-7"
              rules={[
                {
                  required: false,
                },
                {
                  pattern: /^[a-zA-Z0-9._%+-]+@+[a-zA-Z 0-9.-]+\.com$/,
                  message: t("EmailMustBeGmail"),
                },
              ]}
            >
              <Input
                placeholder="example@gmail.com"
                className=" h-[40px] p-2"
              />
            </Form.Item>
            <Form.Item
              label={t("Address")}
              name="address"
              className="h-16 mb-7"
            >
              <Input placeholder="Iraq - Baghdad" className=" h-[40px] p-2" />
            </Form.Item>

            <Button
              loading={loading}
              disabled={disable}
              type="primary"
              htmlType="submit"
            >
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
            <div className="w-full flex flex-col items-center">
              <img src={Logo} className="w-[198px]" alt="Dr.Lab" />

              <div className="w-full handletext">
                <h1 className="">{t("Inputs")}</h1>
              </div>
            </div>

            <div className="flex flex-col handleInputs">
              <Input
                size="large"
                style={{ width: "100%", textAlign: "center" }}
                className="h-12"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={t("SerialNumber")}
              />

              <Button
                disabled={!key || key.length < 8 || disable}
                loading={loading}
                type="primary"
                block
                className="h-12"
                onClick={checkSerial}
              >
                {t("Login")}
              </Button>

              <div className="h-full flex flex-col gap-4 handleOr">
                <div className="w-full border-[0.5px] relative">
                  <p className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 font-semibold text-base text-[#0000009d]">
                    {t("or")}
                  </p>
                </div>
                <p
                  className="text-[#000000a1] text-center text-base font-semibold leading-[29.05px]"
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
                    checkedChildren="En"
                    unCheckedChildren="عربي"
                    checked={lang === "ar"}
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

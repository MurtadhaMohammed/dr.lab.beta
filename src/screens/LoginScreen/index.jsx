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

const LoginScreen = () => {
  const [key, setKey] = useState("");
  const [phone, setPhone] = useState("");
  const { setIsLogin } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [UUID, setUUID] = useState(null);
  const [isForm, setIsForm] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();


  const getUUID = async () => {
    const resp = await send({ query: "getUUID" });
    setUUID(resp.UUID);
  };

  const getPlatform = () => {
    const { userAgent } = navigator;
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "MacOS";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown";
  };

  useEffect(() => {
    getUUID();
  }, []);

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

      console.log("API Response from getClient:", resp);

      if (resp.success) {
        const { client, serialId, exp, startAt } = resp;
        localStorage.setItem("lab-user", JSON.stringify(client));
        localStorage.setItem("lab-serial-id", serialId);
        localStorage.setItem("lab-exp", exp);
        localStorage.setItem("lab-created", startAt);
        setIsLogin(true);
      } else {
        setIsForm(false);
        message.error(resp.message || "Serial not found!");
      }
    } catch (error) {
      console.log(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const register = async () => {
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
        },
        auth: false,
      });

      if (resp.success) {
        const { client, serialId, exp, startAt } = resp;
        localStorage.setItem("lab-user", JSON.stringify(client));
        localStorage.setItem("lab-serial-id", serialId);
        localStorage.setItem("lab-exp", exp);
        localStorage.setItem("lab-created", startAt);
        setIsLogin(true);
      } else {
        setIsForm(false);
        message.error(resp.message || "Serial not found!");
      }
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
                  message: t("PleaseInputyourName!"),
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
                  message: t("PleaseInputYourLabName!"),
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
                  message: t("PleaseInputYourPhone!"),
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

            <Form.Item label={t("Address")} name="address" className="h-16 mb-8">
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
        //         title={
        //           <div className="text-center py-6 relative">
        //             <div
        //               class="pattern-isometric pattern-indigo-400 pattern-bg-white 
        // pattern-size-6 pattern-opacity-5 absolute inset-0"
        //             ></div>
        //             <Avatar
        //               className="w-[80px] h-[80px]"
        //               icon={<UserOutlined className="text-[30px]" />}
        //             />
        //             {/* <Typography.Text className="block text-[22px]">Login</Typography.Text> */}
        //             <Typography.Text className="block mt-[8px]  text-[18px] font-bold">
        //               Login.
        //             </Typography.Text>
        //             <Typography.Text className="block  font-normal" type="secondary">
        //               Please enter your info.
        //             </Typography.Text>
        //           </div>
        //         }
        >

          <Space direction="vertical" size={32} className="w-96 h-full">
            <div className="w-full flex flex-col items-center gap-8">
              <img src={Logo} className="w-[198px]" alt="Dr.Lab" />

              <div className="w-full">
                <h1 className=" text-[32px] text-center leading-[43.57px] !font-light mb-2 inter">
                  {t("Try")} <span className=" !font-bold">Dr.lab</span> {t("businessplan")}
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
                <p className="text-[#000000a1] text-center text-base font-semibold leading-[29.05px] inter" onClick={() => setIsForm(true)}>{t("clickHereToGetA")}
                  <span className="text-[#3853A4] hover:cursor-pointer hover:text-[#0442ff]">{t("FreeTrial")}</span></p>
              </div>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default LoginScreen;

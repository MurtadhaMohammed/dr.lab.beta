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
import { useAppStore } from "../../appStore";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";
import { send } from "../../control/renderer";
import isValidPhoneNumber from "../../helper/phoneValidation";
import background from "../../assets/login.svg";

const LoginScreen = () => {
  const [key, setKey] = useState(null);
  const [phone, setPhone] = useState(null);
  const { setIsLogin } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [UUID, setUUID] = useState(null);
  const [isForm, setIsForm] = useState(false);
  const [form] = Form.useForm();

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

  const getPlatform = () => {
    const { userAgent } = navigator;
    if (userAgent.includes("Win")) return "Windows";
    if (userAgent.includes("Mac")) return "MacOS";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown";
  };

  const login = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        "https://dr-lab-apiv2.onrender.com/api/client/register-device",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serial: key,
            device: UUID,
            platform: getPlatform(),
          }),
        }
      );

      if (resp.status === 200) {
        let data = await resp.json();
        setLoading(false);
        localStorage.setItem("lab-exp", data.exp);
        localStorage.setItem("lab-serial-id", data.id);
        localStorage.setItem("lab-created", data.registeredAt);
        if (!data?.client) setIsForm(true);
        else {
          localStorage.setItem("lab-user", JSON.stringify(data?.client));
          setIsLogin(true);
        }
      } else message.error("Serial not found!");
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setLoading(false);
    }
  };

  const getClient = async () => {
    setLoading(true);
    try {
      const resp = await fetch(
        //"http://localhost:3000/api/client/check-client",
        "https://dr-lab-apiv2.onrender.com/api/client/check-client",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            serial: key,
          }),
        }
      );

      if (resp.status === 200) {
        let data = await resp.json();
        if (data.success) {
          register();
        } else {
          console.log(data.message);
          setIsForm(true);
          setLoading(false);
        }
      } else {
        let data = await resp.json();
        message.error(data?.message || "Serial not found!");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setLoading(false);
    }
  };

  const register = async (values) => {
    setLoading(true);
    try {
      const resp = await fetch(
        // "http://localhost:3000/api/client/register",
        "https://dr-lab-apiv2.onrender.com/api/client/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serial: key,
            device: UUID,
            platform: getPlatform(),
            phone,
            client: values || null,
          }),
        }
      );

      if (resp.status === 200) {
        let data = await resp.json();
        setLoading(false);
        localStorage.setItem("lab-exp", data.serial.exp);
        localStorage.setItem("lab-serial-id", data.serial.id);
        localStorage.setItem("lab-created", data.serial.registeredAt);
        localStorage.setItem("lab-user", JSON.stringify(data.client));
        setIsLogin(true);
      } else {
        let data = await resp.json();
        message.error(data?.message || "Error");
        setIsLogin(true);
      }
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setLoading(false);
    }
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
        <Card className="w-[400px]" title="Add Your Info">
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
              label="Full Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your Name!",
                },
              ]}
            >
              <Input placeholder="Ali M. Salim" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              rules={[
                {
                  required: true,
                  message: "Please input your Phone!",
                },
              ]}
            >
              <Input placeholder="07xxxxxxxx" />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input type="email" placeholder="example@email.com" />
            </Form.Item>

            <Form.Item label="Address" name="address">
              <Input placeholder="Iraq - baghdad" />
            </Form.Item>

            <Button loading={loading} type="primary" htmlType="submit">
              Continue
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
            body:{
              padding: 32
            }
          }}
          title={
            <div className="text-center py-6 relative">
              <div
                class="pattern-isometric pattern-indigo-400 pattern-bg-white 
  pattern-size-6 pattern-opacity-5 absolute inset-0"
              ></div>
              <Avatar className="w-[80px] h-[80px]" icon={<UserOutlined  className="text-[30px]"/>} />
              {/* <Typography.Text className="block text-[22px]">Login</Typography.Text> */}
              <Typography.Text
                className="block mt-[8px]  text-[18px] font-bold"
                
              >
               Login.
              </Typography.Text>
              <Typography.Text
                className="block  font-normal"
                type="secondary"
              >
                Please enter your info.
              </Typography.Text>
            </div>
          }
        >
          <Space direction="vertical" size={16}>
            <Input
             size="large"
              style={{ width: 300, textAlign: "center" }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
            />
            <Input
             size="large"
              style={{ width: 300, textAlign: "center" }}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Serial Number"
            />
            <Divider style={{ margin: 0 }} />
            <Button
              disabled={!key || key.length < 8 || !isValidPhoneNumber(phone)}
              loading={loading}
              type="primary"
              block
              size="large"
              onClick={getClient}
            >
              Login
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default LoginScreen;

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
import { FullscreenOutlined, LeftCircleOutlined, UserOutlined } from "@ant-design/icons";
import { send } from "../../control/renderer";
import isValidPhoneNumber from "../../helper/phoneValidation";
import background from "../../assets/login.svg";
import { apiCall } from "../../libs/api";
import BackIcon from "./BackIcon";

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

  const getClient = async () => {
    setLoading(true);
    try {
      const resp = await apiCall({
        method: "POST",
        pathname: "/app/check-client",
        isFormData: false,
        data: {
          phone,
          serial: key,
        },
      });

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
      const resp = await apiCall({
        method: "POST",
        pathname: "/app/register",
        isFormData: false,
        data: {
          name,
          labName,
          serial: key,
          device: UUID,
          // platform: getPlatform(),
          phone,
          client: values || null,
        },
      });

      if (resp.status === 200) {
        let data = await resp.json();
        setLoading(false);
        localStorage.setItem("lab-exp", data.serial.exp);
        localStorage.setItem("lab-serial-id", data.serial.id);
        localStorage.setItem("lab-created", data.serial.registeredAt);
        localStorage.setItem("lab-user", JSON.stringify(data.client));
        setIsLogin(true);
      }
       else {
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

  const handleClose = () => {
    setIsForm(false);
  }

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
        <Card className="w-[400px]" title={<BackIcon onClose={handleClose} />} >
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
              className="h-16 mb-5"
              rules={[
                {
                  required: true,
                  message: "Please input your Name!",
                },
              ]}
            >
              <Input placeholder="Ali M. Salim" className=" h-[40px] mt-0.5" />
            </Form.Item>
            <Form.Item
              label="Lab Name"
              name="labName"
              className="h-16 mb-5"
              rules={[
                {
                  required: true,
                  message: "Please input your Lab Name!",
                },
              ]}
            >
              <Input placeholder="Ali M. Salim" className=" h-[40px] p-2" />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone"
              className="h-16 mb-5"
              rules={[
                {
                  required: true,
                  message: "Please input your Phone!",
                },
              ]}
            >
              <Input placeholder="07xxxxxxxx" className=" h-[40px] p-2" />
            </Form.Item>

            <Form.Item label="Email" name="email" className="h-16 mb-5">
              <Input type="email" placeholder="example@email.com" className=" h-[40px] p-2" />
            </Form.Item>

            <Form.Item label="Address" name="address" className="h-16 mb-8">
              <Input placeholder="Iraq - baghdad" className=" h-[40px] p-2" />
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
            body: {
              padding: 32,
            },
          }}
          title={
            <div className="text-center py-6 relative">
              <div
                class="pattern-isometric pattern-indigo-400 pattern-bg-white 
                    pattern-size-6 pattern-opacity-5 absolute inset-0"
              ></div>
              <Avatar
                className="w-[80px] h-[80px]"
                icon={<UserOutlined className="text-[30px]" />}
              />
              {/* <Typography.Text className="block text-[22px]">Login</Typography.Text> */}
              <Typography.Text className="block mt-[8px]  text-[18px] font-bold">
                Login.
              </Typography.Text>
              <Typography.Text className="block  font-normal" type="secondary">
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

            <div className="w-full flex justify-center">
              <p className="text-[#0006] hover:text-black hover:cursor-pointer" onClick={() => setIsForm(true)}>Take a Trail</p>
            </div>

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

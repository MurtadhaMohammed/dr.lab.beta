import { Button, Card, Form, Input, Space, message } from "antd";
import "./style.css";
import { useEffect, useState } from "react";
import { useAppStore } from "../../appStore";
import dayjs from "dayjs";
import { send } from "../../control/renderer";

const LoginScreen = () => {
  const [key, setKey] = useState(null);
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

  const onSave = async (values) => {
    setLoading(true);
    try {
      const resp = await fetch(
        "https://dr-lab-apiv2.onrender.com/api/client/add-client",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            serialId: parseInt(localStorage.getItem("lab-serial-id")),
          }),
        }
      );

      if (resp.status === 200) {
        let data = await resp.json();
        setLoading(false);
        localStorage.setItem("lab-user", JSON.stringify(data));
        setIsLogin(true);
      } else message.error("Serial not found!");
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      {isForm ? (
        <Card className="w-[400px]" title="Add Your Info">
          <Form
            form={form}
            onFinish={onSave}
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
        <Card>
          <Space direction="vertical" size={16}>
            <Input
              style={{ width: 300, textAlign: "center" }}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Serial Number"
            />
            <Button
              disabled={!key || key.length < 8}
              loading={loading}
              type="primary"
              block
              onClick={login}
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

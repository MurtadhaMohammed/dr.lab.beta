import { Button, Card, Input, Space, message } from "antd";
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

  const login = async () => {
    setLoading(true);
    try {
      const resp = await fetch("https://lab-beta-api.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          UUID,
        }),
      });
      const data = await resp.json();
      setLoading(false);

      if (data.success) {
        localStorage.setItem("lab-exp", data.user.exp);
        localStorage.setItem("lab-id", data.user.id);
        let createdAt = localStorage.getItem("lab-created");
        if (!createdAt) {
          localStorage.setItem("lab-created", dayjs().toISOString());
        }
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
    </div>
  );
};

export default LoginScreen;

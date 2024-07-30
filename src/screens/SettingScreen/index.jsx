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
  Switch
} from "antd";
import { UserOutlined } from "@ant-design/icons";
// import headImage from "../../../head.png";
import fileDialog from "file-dialog";
import { send } from "../../control/renderer";
import { useAppStore } from "../../appStore";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const SettingsScreen = () => {
  const [imagePath, setImagePath] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signoutLoading, setSignoutLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const { user, setPrintFontSize, printFontSize, setIsLogin } = useAppStore();
  const [form] = Form.useForm();

  const { t } = useTranslation();

  async function fetchImagePath() {
    setImagePath(null);
    try {
      const response = await fetch("http://localhost:3001/head.png"); // Adjust URL if needed
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

  // async function loadImage() {
  //   try {
  //     // Dynamically import the image
  //     const headImageModule = await import("/head.png");
  //     const imgURL = headImageModule.default || headImageModule;
  //     setImagePath(imgURL);

  //     console.log("Image loaded successfully:", imgURL);
  //   } catch (err) {
  //     console.error("Failed to load image:", err);
  //   }
  // }

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
  };

  return (
    <div className="settings-page pb-[60px]">
      <Card styles={{ body: { padding: 46 } }}>
        <section className="flex items-center justify-between w-full mb-[34px]">
          <div className="flex items-center gap-4">
            <Avatar size={"large"} icon={<UserOutlined />} />
            <div>
              <b className="text-[16px]">{user?.name}</b>
              <span className="text-[14px] text-[#A5A5A5] block -mt-[6px]">
                {user?.phone}
              </span>
            </div>
          </div>
          <Popconfirm
            placement="rightBottom"
            onConfirm={signout}
            title="Signout Confirm"
            description="Do you want to signout form this app ?"
          >
            <Button loading={signoutLoading} danger>
              {t("SignOut")}
            </Button>
          </Popconfirm>
        </section>

        <section>
          <Space direction="vertical">
            <Switch
              checkedChildren="عربي"
              unCheckedChildren="Eng"
              checked={language === "ar"}
              onChange={handleLang}
            />
          </Space>
        </section>

        <section>
          <p className="pl-[4px] opacity-60">Account Info</p>
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
                    label="Full Name"
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Name!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>

                <Col span={6}>
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
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Email" name="email">
                    <Input type="email" />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item label="Address" name="address">
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
                          htmlType="submit"
                        >
                          Save Changes
                        </Button>
                      </Form.Item>

                      <Button disabled={loading} onClick={handelCancel}>
                        Cancel
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
            <p className="pl-[4px] opacity-60">PDF Setting</p>
            <Card className="mt-[6px]">
              <div className="flex justify-between items-center">
                <b className="text-[14px]">Image Cover</b>
                <Button type="link" onClick={handleChangeFile}>
                  Change Image
                </Button>
              </div>
              <div className="w-full border border-[#eee]  rounded-md overflow-hidden bg-[#f6f6f6]">
                {imagePath && <img className="w-full" src={imagePath} />}
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <b className="text-[14px]">Font Size</b>
                <Select
                  value={printFontSize}
                  variant="borderless"
                  onChange={handleSizeChange}
                >
                  <Select.Option value={14}>Medium</Select.Option>
                  <Select.Option value={12}>Small</Select.Option>
                  <Select.Option value={16}>Large</Select.Option>
                </Select>
              </div>
            </Card>
          </div>
          <div>
            <p className="pl-[4px] opacity-60">Subscription Info</p>
            <Card className="mt-[6px]">
              <b className="text-[14px]">Current Plan</b>
              <div className="rounded-[4px] bg-[#F6F6F6] px-[8px] py-[4px] mt-[6px]">
                Free Trail -{" "}
                <span className="text-[12px] text-[#a5a5a5]">
                  Will expired in 5 days.
                </span>
              </div>
            </Card>
          </div>
        </section>
      </Card>
    </div>
  );
};

export default SettingsScreen;

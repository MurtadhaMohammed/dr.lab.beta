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
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import headImage from "../../../head.png";
// import newHeadImage from "../../../head.png";
import fileDialog from "file-dialog";
import { send } from "../../control/renderer";
import { useAppStore } from "../../appStore";
import path from "path-browserify";
// import path from 'path';

const SettingsScreen = () => {
  const [imagePath, setImagePath] = useState(headImage);
  const [isUpdate, setIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signoutLoading, setSignoutLoading] = useState(false);
  const { user, setPrintFontSize, printFontSize, setIsLogin } = useAppStore();
  const [form] = Form.useForm();

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


  const handleChangeFile = async () => {
    fileDialog().then(async (file) => {
      send({
        query: "saveHeadImage",
        file: file[0]?.path,
      }).then((resp) => {
        if (resp.success) {
          path ? "../../../head.png" : "../../head.png"
            .then((module) => {
              setImagePath(module.default);
            })
            .catch((err) => {
              console.error("Failed to load image:", err);
            });
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
          message.success("Update Succesfully.");
          setIsUpdate(false);
        } else message.error("Update faild!");
      } catch (error) {
        console.log(error);
        message.error(error.message);
        setLoading(false);
      }
    });
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
              Sign Out
            </Button>
          </Popconfirm>
        </section>
        <section>
          <p className="pl-[4px] opacity-60">Account Info</p>
          <Card className="mt-[6px]">
            <Form
              form={form}
              //   initialValues={{
              //     name: user?.name,
              //     email:user?.email,
              //     phone: user?.phone,
              //     address: user?.address,
              //   }}
              onFinish={handleUpdateClient}
              //   onFinishFailed={onFinishFailed}
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
                <img className="w-full" src={imagePath} />
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
            <Card className="mt-[6px] bg-[#00ff552b] border-none">
              <b className="text-[18px]">Serial Number</b>
              <p>089898727</p>
              <p className="pt-[8px]">
                Created At 2024 Jan, 03 | <b>360</b> days for expire{" "}
              </p>
            </Card>
          </div>
        </section>
      </Card>
    </div>
  );
};

export default SettingsScreen;

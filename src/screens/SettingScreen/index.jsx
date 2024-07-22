import React, { useState } from "react";
import "./style.css";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Space,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import headImage from "../../../head.png";
// import newHeadImage from "../../../head.png";
import fileDialog from "file-dialog";
import { send } from "../../control/renderer";

const SettingsScreen = () => {
  const [imagePath, setImagePath] = useState(headImage);

  const handleChangeFile = async () => {
    fileDialog().then(async (file) => {
      send({
        query: "saveHeadImage",
        file: file[0]?.path,
      }).then((resp) => {
        if (resp.success) {
          import("../../../head.png")
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

  return (
    <div className="settings-page pb-[60px]">
      <Card styles={{ body: { padding: 46 } }}>
        <section className="flex items-center justify-between w-full mb-[34px]">
          <div className="flex items-center gap-4">
            <Avatar size={"large"} icon={<UserOutlined />} />
            <div>
              <b className="text-[16px]">Murtadha M. Abed</b>
              <span className="text-[14px] text-[#A5A5A5] block -mt-[6px]">
                07719009898
              </span>
            </div>
          </div>
          <Button danger>Sign Out</Button>
        </section>
        <section>
          <p className="pl-[4px] opacity-60">Account Info</p>
          <Card className="mt-[6px]">
            <Form
              initialValues={{
                name: "Murtadha M. Abed",
                email: "murtadha@email.co",
                phone: "07718998982",
                address: "Iraq - Baghdad",
              }}
              //   onFinish={onFinish}
              //   onFinishFailed={onFinishFailed}
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

                <Col span={6}>
                 <Space> <Form.Item label=" ">
                    <Button type="primary" htmlType="submit">
                      Save Changes
                    </Button>
                  </Form.Item>
                  <Form.Item label=" ">
                    <Button  htmlType="submit">
                      Cancel
                    </Button>
                  </Form.Item></Space>
                </Col>
                
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
                <Select value={"md"} variant="borderless">
                  <Select.Option value="md">Medium</Select.Option>
                  <Select.Option value="sm">Small</Select.Option>
                  <Select.Option value="lg">Large</Select.Option>
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

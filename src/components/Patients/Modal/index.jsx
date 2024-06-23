import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { useAppStore, usePatientStore } from "../../../appStore";
import "./style.css";
import { send } from "../../../control/renderer";

const { Text } = Typography;

export const PureModal = () => {
  const { setIsReload, isReload } = useAppStore();
  const {
    id,
    uID,
    name,
    birth,
    phone,
    email,
    gender,
    setName,
    createdAt,
    setBirth,
    setPhone,
    setEmail,
    setGender,
    isModal,
    setIsModal,
    setReset,
  } = usePatientStore();

  const handleSubmit = () => {
    let data = {
      uID,
      name,
      gender,
      email,
      phone,
      birth: birth.toString(),
      updatedAt: Date.now(),
    };


    if (id) {
      send({
        doc: "patients",
        query: "update",
        condition: { _id: id },
        data: { ...data, createdAt },
      }).then(({ err }) => {
        if (err) message.error("Error !");
        message.success("Save Succefful.");
        setReset();
        setIsModal(false);
        setIsReload(!isReload);
      });
    } else {
      send({
        doc: "patients",
        query: "insert",
        data: { ...data, createdAt: Date.now() },
      }).then(({ err }) => {
        if (err) message.error("Error !");
        else {
          message.success("Save Succefful.");
          setReset();
          setIsModal(false);
          setIsReload(!isReload);
        }
      });
    }
  };

  return (
    <Modal
      title={`${id ? "Edit" : "Add"} New Patient`}
      open={isModal}
      width={400}
      onOk={() => {
        setIsModal(false);
      }}
      onCancel={() => {
        setIsModal(false);
      }}
      footer={
        <Space>
          <Button
            onClick={() => {
              setIsModal(false);
            }}
          >
            Close
          </Button>
          <Button
            disabled={!name || !gender || !birth}
            type="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Space>
      }
      centered
    >
      <div className="create-patient-modal">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>Patient Name</Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ali Mohammed"
              />
            </Space>
          </Col>
          <Col span={10}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>Birth Date</Text>
              <DatePicker
                picker="year"
                value={birth}
                onChange={(val) => setBirth(val)}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={14}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>
                Phone Number <Text type="secondary">(Optional)</Text>
              </Text>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxxxxxxxx"
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={16}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>
                Email <Text type="secondary">(Optional)</Text>
              </Text>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: mail@example.com"
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={0}>
              <Text>Gender</Text>
              <Radio.Group
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <Space>
                  <Card hoverable bodyStyle={{ padding: 8 }}>
                    <Radio value={"male"}> Male</Radio>
                  </Card>
                  <Card hoverable bodyStyle={{ padding: 8 }}>
                    <Radio value={"female"}>Female</Radio>
                  </Card>
                </Space>
              </Radio.Group>
            </Space>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

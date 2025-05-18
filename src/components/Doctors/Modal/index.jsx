import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  Modal,
  Radio,
  Row,
  Space,
  Typography,
  message,
} from "antd";
import { useAppStore, useDoctorStore } from "../../../libs/appStore";
import "./style.css";
import { send } from "../../../control/renderer";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

export const PureModal = () => {
  const { setIsReload, isReload } = useAppStore();
  const {
    id,
    name,
    birth,
    phone,
    email,
    gender,
    address,
    type,
    setName,
    setBirth,
    setPhone,
    setEmail,
    setGender,
    setAddress,
    setType,
    isModal,
    setIsModal,
    setReset,
  } = useDoctorStore();
  const { t } = useTranslation();

  const handleSubmit = () => {
    let data = {
      name,
      gender,
      email,
      phone,
      address,
      type,
    };

    if (id) {
      send({
        query: "updateDoctor",
        id,
        data,
      })
        .then((resp) => {
          if (resp.success) {
            message.success(t("Patientupdatedsuccessfully"));
            setReset();
            setIsModal(false);
            setIsReload(!isReload);
          } else {
            console.error("Error updating doctor:", resp.error);
            message.error(t("Failedtoupdatepatient"));
          }
        })
        .catch((err) => {
          console.error("Error in IPC communication:", err);
          message.error("Failed to communicate with server.");
        });
    } else {
      send({
        query: "addDoctor",
        data,
      })
        .then((resp) => {
          if (resp.success) {
            message.success(t("Patientaddedsuccessfully"));
            setReset();
            setIsModal(false);
            setIsReload(!isReload);
          } else {
            console.error("Error adding doctor:", resp.error);
            message.error(t("Failedtoaddpatient"));
          }
        })
        .catch((err) => {
          console.error("Error in IPC communication:", err);
          message.error("Failed to communicate with server.");
        });
    }
  };

  return (
    <Modal
      title={`${id ? t("Edit") : t("Add")} ${t("Doctor")}`}
      open={isModal}
      width={440}
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
            {t("Close")}
          </Button>
          <Button
            disabled={!name || !gender}
            type="primary"
            onClick={handleSubmit}
          >
            {t("Save")}
          </Button>
        </Space>
      }
      centered
    >
      <div className="create-doctors-modal">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>{t("DoctorName")}</Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("ExName")}
              />
            </Space>
          </Col>
          
          <Col span={12}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>
                {t("PhoneNumber")} <Text type="secondary">{t("Optional")}</Text>
              </Text>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxxxxxxxx"
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={12}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>
                {t("Email")} <Text type="secondary">{t("Optional")}</Text>
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
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>
                {t("DoctorAddress")} <Text type="secondary">{t("Optional")}</Text>
              </Text>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>
                {t("DoctorType")} <Text type="secondary">{t("Optional")}</Text>
              </Text>
              <Input
                value={type}
                onChange={(e) => setType(e.target.value)}
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={0}>
              <Text>{t("Gender")}</Text>
              <Radio.Group
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <Space>
                  <Card hoverable bodyStyle={{ padding: 8 }}>
                    <Radio value={"male"}> {t("Male")}</Radio>
                  </Card>
                  <Card hoverable bodyStyle={{ padding: 8 }}>
                    <Radio value={"female"}>{t("Female")}</Radio>
                  </Card>
                </Space>
              </Radio.Group>
            </Space>
          </Col>
          <Divider />
        </Row>
      </div>
    </Modal>
  );
};

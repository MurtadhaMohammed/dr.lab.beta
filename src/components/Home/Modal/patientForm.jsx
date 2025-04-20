import {
  Card,
  Col,
  DatePicker,
  Divider,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import { useHomeStore } from "../../../libs/appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

const PatientForm = () => {
  const {
    name,
    birth,
    phone,
    email,
    gender,
    setName,
    setBirth,
    setPatientID,
    setPhone,
    setEmail,
    setGender,
    setUID,
    id,
    isModal,
  } = useHomeStore();
  const [patientsList, setPatientsList] = useState([]);
  const [selected, setSelected] = useState(null);
  const { t } = useTranslation();

  const getPtients = (querySearch = "") => {
    send({
      query: "getPatients",
      q: querySearch,
      skip: 0,
      limit: 10,
    })
      .then((resp) => {
        if (resp.success) {
          setPatientsList(resp.data);
        } else {
          console.error("Error fetching patients:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  useEffect(() => {
    isModal && getPtients();
  }, [isModal]);

  useEffect(() => {
    if (!selected) return;
    let patientObj = patientsList.find((el) => el?.id === selected);
    setPatientID(patientObj?.id);
    setBirth(dayjs(patientObj?.birth));
    setName(patientObj?.name);
    setEmail(patientObj?.email);
    setPhone(patientObj?.phone);
    setGender(patientObj?.gender);
    setUID(patientObj?.uID);
  }, [selected]);

  return (
    <div className="user-form">
      <Select
        showSearch
        disabled={id}
        placeholder={t("SelectPatient")}
        optionFilterProp="children"
        style={{ width: "100%" }}
        onSearch={getPtients}
        onSelect={setSelected}
        allowClear
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={patientsList?.map((el) => {
          return {
            label: el?.name,
            value: el?.id,
          };
        })}
      />
      <Divider />
      <Row gutter={[16, 16]} className="frutiger-font">
    <Col span={24}>
        <Space style={{ width: "100%" }} direction="vertical" size={4}>
            <Text>{t("PatientName")}</Text>
            <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("ExName")}
            />
        </Space>
    </Col>
    <Col span={10}>
        <Space style={{ width: "100%" }} direction="vertical" size={4}>
            <Text>{t("BirthDate")}</Text>
            <DatePicker
                picker={t("year")}
                value={birth}
                onChange={(val) => setBirth(val)}
                style={{ width: "100%" }}
            />
        </Space>
    </Col>
    <Col span={14}>
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
    <Col span={16}>
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
        <Space style={{ width: "100%" }} direction="vertical" size={0}>
            <Text>{t("Gender")}</Text>
            <Radio.Group
                value={gender}
                onChange={(e) => setGender(e.target.value)}
            >
                <Space>
                    <Card hoverable bodyStyle={{ padding: 8 }}>
                        <Radio value={"male"}>{t("Male")}</Radio>
                    </Card>
                    <Card hoverable bodyStyle={{ padding: 8 }}>
                        <Radio value={"female"}>{t("Female")}</Radio>
                    </Card>
                </Space>
            </Radio.Group>
        </Space>
    </Col>
</Row>

    </div>
  );
};

export default PatientForm;

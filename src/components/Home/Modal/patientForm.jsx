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
import { useHomeStore } from "../../../appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import dayjs from "dayjs";

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
    setPhone,
    setEmail,
    setGender,
    setUID,
    id,
    isModal,
  } = useHomeStore();
  const [patientsList, setPatientsList] = useState([]);
  const [selected, setSelected] = useState(null);

  const getPtients = (querySearch = "") => {
    let queryKey = new RegExp(querySearch, "gi");
    send({
      doc: "patients",
      query: "find",
      search: { name: queryKey },
      limit: 10,
      skip: 0,
    }).then(({ err, rows }) => {
      if (err) message.error("Error !");
      else setPatientsList(rows);
    });
  };

  useEffect(() => {
    isModal && getPtients();
  }, [isModal]);

  useEffect(() => {
    if (!selected) return;
    let patientObj = patientsList.find((el) => el?._id === selected);
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
        placeholder="Select Patient"
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
            value: el?._id,
          };
        })}
      />
      <Divider />
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
  );
};

export default PatientForm;

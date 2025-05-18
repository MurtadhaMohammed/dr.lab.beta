import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import { useHomeStore } from "../../../libs/appStore";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { useTranslation } from "react-i18next";
import { RxReset } from "react-icons/rx";

const { Text } = Typography;

const DoctorForm = () => {
  const { isModal, doctorRow, setDoctorRow, id } = useHomeStore();
  const [doctorsList, setDoctorsList] = useState([]);
  const [selected, setSelected] = useState(null);
  const { t } = useTranslation();

  const getDoctors = (querySearch = "") => {
    send({
      query: "getDoctors",
      q: querySearch,
      skip: 0,
      limit: 10,
    })
      .then((resp) => {
        if (resp.success) {
          setDoctorsList(resp.data);
        } else {
          console.error("Error fetching patients:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  useEffect(() => {
    isModal && getDoctors();
  }, [isModal]);

  useEffect(() => {
    if (!selected) return;
    let doctorObj = doctorsList.find((el) => el?.id === selected);
    setDoctorRow(doctorObj);
  }, [selected]);

  const handleChangeInput = (e) => {
    let { name, value } = e.target;
    setDoctorRow({ ...doctorRow, [name]: value });
  };

  return (
    <div className="user-form">
      <Select
        showSearch
        placeholder={t("SelectDoctor")}
        optionFilterProp="children"
        style={{ width: "100%" }}
        onSearch={getDoctors}
        onSelect={setSelected}
        allowClear
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={doctorsList?.map((el) => {
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
            <Text>{t("DoctorName")}</Text>
            <Input
              name="name"
              value={doctorRow?.name}
              onChange={handleChangeInput}
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
              value={doctorRow?.phone}
              name="phone"
              onChange={handleChangeInput}
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
              name="email"
              value={doctorRow?.email}
              onChange={handleChangeInput}
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
              name="address"
              value={doctorRow?.address}
              onChange={handleChangeInput}
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
              name="type"
              value={doctorRow?.type}
              onChange={handleChangeInput}
              style={{ width: "100%" }}
            />
          </Space>
        </Col>

        <Col span={24}>
          <Space style={{ width: "100%" }} direction="vertical" size={0}>
            <Text>{t("Gender")}</Text>
            <Radio.Group
              value={doctorRow?.gender}
              name="gender"
              onChange={handleChangeInput}
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
        <Col span={24}>
          <Button
            onClick={() => {
              setDoctorRow({});
              setSelected(null);
            }}
            icon={<RxReset />}
            type="link"
          >
            Reset Fields
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorForm;

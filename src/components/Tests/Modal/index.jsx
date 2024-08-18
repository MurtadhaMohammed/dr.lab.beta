import {
  Button,
  Checkbox,
  Col,
  Divider,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from "antd";
import { useAppStore, useTestStore } from "../../../libs/appStore";
import { send } from "../../../control/renderer";
import "./style.css";
import { useEffect, useRef, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text } = Typography;

export const PureModal = () => {
  const {
    isModal,
    setIsModal,
    name,
    price,
    normal,
    setName,
    setPrice,
    setNormal,
    isSelecte,
    setIsSelecte,
    id,
    setReset,
    options,
    setOptions,
  } = useTestStore();
  const { setIsReload, isReload } = useAppStore();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleIsSelecteChange = (e) => {
    setIsSelecte(e.target.checked);
    if (e.target.checked) {
      setNormal("");
    }
  };

  const handleSubmit = () => {
    const data = {
      name,
      price,
      normal: isSelecte ? "" : normal,
      isSelecte,
      options: isSelecte ? options : [],
      updatedAt: Date.now(),
    };

    const query = id ? "editTest" : "addTest";
    const requestData = id ? { query, data, id } : { query, data };

    send(requestData)
      .then((resp) => {
        if (resp.success) {
          setReset();
          setIsModal(false);
          setIsReload(!isReload);
        } else {
          console.error(`Error ${id ? 'updating' : 'adding'} test:`, resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  return (
    <Modal
      title={`${id ? t("Edit") : t("Create")} ${t("TestItem")}`}
      open={isModal}
      width={400}
      onCancel={() => setIsModal(false)}
      footer={
        <Space>
          <Button onClick={() => setIsModal(false)}>{t("Close")}</Button>
          <Button
            disabled={!name || price === "" || price === null}
            type="primary"
            onClick={handleSubmit}
          >
            {t("Save")}
          </Button>
        </Space>
      }
      centered
    >
      <div className="create-item-modal">
        <Row gutter={[16, 16]}>
          <Col span={14}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>{t("TestName")}</Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Vit D3"
              />
            </Space>
          </Col>
          <Col span={10}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>{t("Price")}</Text>
              <InputNumber
                value={price}
                onChange={(val) => setPrice(val)}
                placeholder="Ex: 10000"
                style={{ width: "100%" }}
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>{t("NormalValue")}</Text>
              <Input.TextArea
                value={normal}
                onChange={(e) => setNormal(e.target.value)}
                rows={2}
                placeholder="Ex: Male (4.0-7.0) mg\dl, Female (3.0-5.5) mg\dl"
                style={{ width: "100%" }}
                disabled={isSelecte} // Disable when isSelecte is true
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Checkbox
                checked={isSelecte}
                onChange={handleIsSelecteChange} // Handle the change
              >
                {t("IsSelect")}
              </Checkbox>
            </Space>
          </Col>
          {isSelecte && (
            <Col span={24}>
              <Space size={[0, 6]} wrap>
                {Array.isArray(options) &&
                  options.map((el, i) => (
                    <Tag key={i} closable color="red" onClose={() => handleClose(el)}>
                      {el}
                    </Tag>
                  ))}
                {inputVisible ? (
                  <Input
                    ref={inputRef}
                    type="text"
                    size="small"
                    style={{ width: 78, verticalAlign: "top" }}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                  />
                ) : (
                  <Tag style={{ background: token.colorBgContainer, borderStyle: "dashed" }} onClick={() => setInputVisible(true)}>
                    <PlusOutlined /> {t("NewOption")}
                  </Tag>
                )}
              </Space>
            </Col>
          )}
        </Row>
      </div>
    </Modal>
  );
};

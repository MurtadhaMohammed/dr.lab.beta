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
import { useAppStore, useTestStore, useTrigger } from "../../../libs/appStore";
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
    createdAt,
    setReset,
    options,
    setOptions,
  } = useTestStore();
  const { setIsReload, isReload } = useAppStore();
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { setFlag } = useTrigger();
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  const handleIsSelecteChange = (e) => {
    setIsSelecte(e.target.checked);
    if (e.target.checked) {
      setNormal("");
      if (options.length === 0) {
        setOptions(["positive", "negative"]);
      }
    } else {
      setOptions([]);
    }
  };

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue]);

  const handleClose = (removedTag) => {
    let newOptions = options.filter((option) => option !== removedTag);
    setIsSelecte(false);
    setTimeout(() => {
      setOptions(newOptions);
      setIsSelecte(true);
    }, 10);
  };
  const showInput = () => {
    setInputVisible(true);
  };
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleInputConfirm = () => {

    if (!Array.isArray(options)) {
      console.error("Options is not an array. Resetting to an empty array.");
      setOptions([]);
    }

    if (inputValue && options.indexOf(inputValue) === -1) {
      setOptions([...options, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const tagInputStyle = {
    width: 78,
    verticalAlign: "top",
  };
  const tagPlusStyle = {
    background: token.colorBgContainer,
    borderStyle: "dashed",
  };

  const handleSubmit = () => {
    let data = {
      name,
      price,
      normal: isSelecte ? "" : normal,
      isSelecte,
      options: isSelecte ? options : [],
      updatedAt: Date.now(),
    };

    if (!id) {
      send({
        query: "addTest",
        data: { ...data },
      })
        .then((resp) => {
          if (resp.success) {
            console.log("Test added with ID:", resp.id);
            message.success(t("Testaddedsuccessfully"));
            setReset();
            setIsModal(false);
            setIsReload(!isReload);
          } else {
            console.error("Erroraddingtest:", resp.error);
            message.error(t("Erroraddingtest:"));
          }
        })
        .catch((err) => {
          console.error("Error in IPC communication:", err);
          message.error("Failed to communicate with server.");
        });
    } else {
      send({
        query: "editTest",
        data: { ...data },
        id,
      })
        .then((resp) => {
          if (resp.success) {
            message.success(t("Testupdatedsuccessfully"));
            setReset();
            setIsModal(false);
            setIsReload(!isReload);
            setFlag(true);
          } else {
            console.error("Error updating test:", resp.error);
            message.error("Failed to update test.");
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
      title={`${id ? t("Edit") : t("Create")} ${t("TestItem")}`}
      open={isModal}
      width={400}
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
                min={0}
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
                disabled={isSelecte}
              />
            </Space>
          </Col>
          <Col span={24}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Checkbox checked={isSelecte} onChange={handleIsSelecteChange}>
                {t("IsSelect")}
              </Checkbox>
            </Space>
          </Col>
          {isSelecte ? (
            <Col span={24}>
              <Space size={[0, 6]} wrap>
                {Array.isArray(options) &&
                  options.map((el, i) => (
                    <Tag
                      key={i}
                      closable
                      color="red"
                      onClose={() => handleClose(el)}
                    >
                      {el}
                    </Tag>
                  ))}
                {inputVisible ? (
                  <Input
                    ref={inputRef}
                    type="text"
                    size="small"
                    style={tagInputStyle}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                  />
                ) : (
                  <Tag style={tagPlusStyle} onClick={showInput}>
                    <PlusOutlined /> {t("NewOption")}
                  </Tag>
                )}
              </Space>
              <br />
            </Col>
          ) : null}
        </Row>
      </div>
    </Modal>
  );
};

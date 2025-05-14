import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useAppStore, useGroupStore } from "../../../libs/appStore";
import "./style.css";
import { useEffect, useState } from "react";
import { send } from "../../../control/renderer";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../../../hooks/useAppThem";
const { Text } = Typography;

export const PureModal = () => {
  const { setIsReload, isReload } = useAppStore();
  const {
    isModal,
    setIsModal,
    tests,
    setTests,
    title,
    setTitle,
    customePrice,
    setCustomePrice,
    id,
    setReset,
  } = useGroupStore();
  const [testsList, setTestsList] = useState([]);
  const [editTest, setEditTest] = useState(null); // State for editing test
  const { t } = useTranslation();
  const { appColors, appTheme } = useAppTheme();

  let skip = 0; // Initialize skip (offset)
  const limit = 10; // Set the limit for the number of tests per batch

  const getTests = (querySearch = "") => {
    send({
      query: "getTests",
      data: { q: querySearch, skip, limit }, // Send skip and limit to backend
    })
      .then((resp) => {
        if (resp.success) {
          if (skip === 0) {
            setTestsList(resp.data);
          } else {
            setTestsList((prev) => [...prev, ...resp.data]);
          }

          if (resp.data.length === limit) {
            skip += limit;
          }
        } else {
          console.error("Error fetching tests:", resp.error);
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  };

  useEffect(() => {
    if (isModal) {
      getTests("");
    }
  }, [isModal]);

  const handleSelect = (testID) => {
    let selectedObj = testsList.find((el) => el?.id === testID);
    if (!selectedObj) return;
    setTests([...tests, selectedObj]);
  };

  const handleDelete = (testID) => {
    setTests(tests?.filter((el) => el?.id !== testID));
  };

  const handleEditChange = (name, value) => {
    if (editTest) {
      setEditTest((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveEdit = () => {
    if (editTest) {
      send({
        query: "editTest",
        data: { ...editTest },
        id: editTest?.id,
      })
        .then((resp) => {
          if (resp.success) {
            message.success(t("Test updated successfully"));
            getTests();
            setTests(
              tests?.map((el) => (el?.id === editTest?.id ? editTest : el))
            );
            setEditTest(null);
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

  const handleSubmit = () => {
    let data = {
      title,
      customePrice,
      tests: tests.map((el) => ({ id: el.id })),
      createdAt: Date.now(),
    };
    if (id) {
      send({
        query: "editPackage",
        data: { ...data },
        id,
      })
        .then((resp) => {
          if (resp.success) {
            setReset();
            setIsModal(false);
            setIsReload(!isReload);
            message.success(t("Packageupdatedsuccessfully"));
          } else {
            console.error("Error updating package:", resp.error);
            message.error(t("Failed to update package."));
          }
        })
        .catch((err) => {
          console.error("Error in IPC communication:", err);
          message.error(t("Failed to communicate with server."));
        });
    } else {
      send({
        query: "addPackage",
        data: { ...data },
      })
        .then((resp) => {
          if (resp.success) {
            setReset();
            setIsModal(false);
            setIsReload(!isReload);
            message.success(t("Packageaddedsuccessfully"));
          } else {
            console.error("Error adding package:", resp.error);
            message.error(t("Failedtoaddpackage"));
          }
        })
        .catch((err) => {
          console.error("Error in IPC communication:", err);
          message.error(t("Failed to communicate with server."));
        });
    }
  };

  return (
    <Modal
      title={`${id ? t("Edit") : t("Create")} ${t("NewPackage")}`}
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
            disabled={tests?.length === 0 || !title}
            onClick={handleSubmit}
            type="primary"
          >
            {t("Save")}
          </Button>
        </Space>
      }
      centered
    >
      <div className="create-package-modal">
        <div className="test-form">
          <Select
            showSearch
            placeholder={t("SelectATest")}
            optionFilterProp="children"
            style={{ width: "100%" }}
            onSearch={getTests}
            onSelect={handleSelect}
            allowClear
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={testsList?.map((el) => {
              return {
                label: el?.name,
                value: el?.id,
                disabled: !!tests.find((item) => item?.id === el?.id),
              };
            })}
          />

          <div className="test-list">
            {tests?.map((el, i) =>
              editTest && editTest?.id === el?.id ? (
                <div key={i} className="test-item app-flex-space">
                  <Space>
                    <Button
                      onClick={() => setEditTest(null)}
                      size="small"
                      type="text"
                      className="text-[#a5a5a5]"
                      icon={<CloseOutlined />}
                    />
                    <Button
                      onClick={handleSaveEdit}
                      size="small"
                      type="text"
                      icon={<CheckOutlined className="text-[#33a733]" />}
                    />
                  </Space>
                  <Space>
                    <Input
                      size="small"
                      className="w-[170]"
                      value={editTest?.name}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                    />
                    <InputNumber
                      size="small"
                      className="w-[80px]"
                      value={editTest?.price}
                      onChange={(value) => handleEditChange("price", value)}
                    />
                    <Text type="secondary">IQD</Text>
                  </Space>
                </div>
              ) : (
                <div
                  key={i}
                  className="test-item app-flex-space"
                  style={{
                    borderColor: appColors.colorBorder,
                  }}
                >
                  <Space>
                    <Button
                      onClick={() => handleDelete(el?.id)}
                      size="small"
                      type="text"
                      className="text-[#a5a5a5]"
                      icon={<DeleteOutlined />}
                    />
                    <Button
                      onClick={() => setEditTest(el)}
                      size="small"
                      type="text"
                      icon={<EditOutlined />}
                    />
                    <Text>{el?.name}</Text>
                  </Space>
                  <Text type="secondary">
                    {Number(el?.price).toLocaleString("en")} IQD
                  </Text>
                </div>
              )
            )}
          </div>
          <div
            className={`inset-x-0 bottom-[10px] relative ${
              appTheme === "dark" ? "bg-[#1f1f1f]" : "bg-white"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-[-20px] h-5 bg-gradient-to-t ${
                appTheme === "dark" ? "from-[#1f1f1f]" : "from-white"
              } to-transparent z-[99]`}
            ></div>
            <Row gutter={[16, 16]}>
              <Col span={15}>
                <Space style={{ width: "100%" }} direction="vertical" size={3}>
                  <Text>{t("Packagetitle")}</Text>
                  <Input
                    placeholder={t("LipidProfile")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Space>
              </Col>
              <Col span={9}>
                <Space direction="vertical" size={3}>
                  <Tooltip title={t("CustomePackageInsteadOfTotal")}>
                    <Space size={3}>
                      <Text>{t("CustomePrice")}</Text>
                      <InfoCircleOutlined
                        style={{ color: "#ff0000", fontSize: 14 }}
                      />
                    </Space>
                  </Tooltip>
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="Ex: 5,000"
                    value={customePrice}
                    onChange={(val) => setCustomePrice(val)}
                    min={0} // Prevent negative values
                  />
                </Space>
              </Col>
            </Row>

            <Divider />
            <div
              className="border border-dashed  rounded-lg p-2 px-4"
              style={{
                backgroundColor: appColors.sideMenuBg,
                borderColor: appColors.colorBorder,
              }}
            >
              <div className="app-flex-space">
                <Text type="secondary"> {t("TotalPrice")} </Text>
                <Text
                  style={
                    customePrice
                      ? {
                          textDecoration: "line-through",
                          opacity: 0.3,
                          fontStyle: "italic",
                          fontWeight: "normal",
                        }
                      : { fontSize: 18, fontWeight: "bold" }
                  }
                >
                  {Number(
                    tests?.map((el) => el?.price)?.reduce((a, b) => a + b, 0)
                  ).toLocaleString("en")}
                  IQD
                </Text>
              </div>
              {customePrice && (
                <div className="app-flex-space">
                  <Text type="secondary">{t("FinalPrice")} </Text>
                  <Text style={{ fontSize: 18 }}>
                    <b>
                      {Number(customePrice).toLocaleString("en")} {t("IQD")}
                    </b>
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

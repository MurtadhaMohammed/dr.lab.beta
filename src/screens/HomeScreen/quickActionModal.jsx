import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Typography,
  message,
  Spin,
  Select,
  Space,
} from "antd";
import {
  CloseOutlined,
} from "@ant-design/icons";

import { useTranslation } from "react-i18next";
import { send } from "../../control/renderer";
import { useHomeStore } from "../../libs/appStore";

const { Text } = Typography;

export const QuickActionsModal = () => {
  const { isQuickActionsModal, setIsQuickActionsModal } = useHomeStore();
  const { t } = useTranslation();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);

  // Load tests from database
  const loadTests = async (query = "") => {
    setLoading(true);
    try {
      const response = await send({
        query: "getTests",
        data: { q: query, limit: 1000, skip: 0 },
      });

      if (response.success) {
        setTests(response.data || []);
      } else {
        message.error("Failed to load tests");
      }
    } catch (error) {
      console.error("Error loading tests:", error);
      message.error("Error loading tests");
    } finally {
      setLoading(false);
    }
  };

  // Load selected tests from localStorage
  const loadSelectedTests = () => {
    const savedActions = localStorage.getItem("actionButtons");
    if (savedActions) {
      try {
        const parsed = JSON.parse(savedActions);
        setSelectedTests(parsed || []);
      } catch (error) {
        console.error("Error parsing saved actions:", error);
        setSelectedTests([]);
      }
    }
  };

  const clearModalData = () => {
    setTests([]);
    setSelectedTests([]);
    setLoading(false);
  };

  useEffect(() => {
    if (isQuickActionsModal) {
      // Clear data first when modal opens
      clearModalData();
      // Then load fresh data
      loadTests();
      loadSelectedTests();
    } else {
      // Clear data when modal closes
      clearModalData();
    }
  }, [isQuickActionsModal]);

  const handleSelectChange = (val) => {
    const item = tests.find((test) => test.id === val);
    setSelectedTests([
      ...selectedTests,
      {
        title: item?.name_en,
        isPrimary: false,
        id: item?.id || null,
      },
    ]);
  };

  const removeTest = (testId) => {
    setSelectedTests((prev) => prev.filter((test) => test.id !== testId));
  };

  const handleSave = () => {
    try {
      localStorage.setItem("actionButtons", JSON.stringify(selectedTests));
      message.success(t("Quick actions saved successfully"));
      setIsQuickActionsModal(false);
    } catch (error) {
      console.error("Error saving quick actions:", error);
      message.error("Failed to save quick actions");
    }
  };

  const handleCancel = () => {
    setIsQuickActionsModal(false);
  };

  return (
    <Modal
      title={t("Quick Actions")}
      open={isQuickActionsModal}
      onCancel={handleCancel}
      destroyOnHidden
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t("Cancel")}
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          {t("Save")}
        </Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Text strong>{t("Select Tests for Quick Actions")}:</Text>
        <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
          {t("Choose tests that will appear as quick action buttons")}
        </Text>
      </div>

      <Spin spinning={loading}>
        <Select
          placeholder={t("Search and select tests...")}
          style={{ width: "100%", marginBottom: 16 }}
          //value={selectedTests?.map((test) => test.name_en)}
          onChange={handleSelectChange}
          showSearch
          filterOption={(input, option) => {
            // console.log({input, option})
            return (
              option?.key?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
            );
          }}
          maxTagCount="responsive"
        >
          {tests.map((test) => (
            <Select.Option
              disabled={selectedTests?.find((el) => el?.id === test.id)}
              key={test.name_en}
              value={test.id}
            >
              {test.name_en} - {t("Price")}:{" "}
              {Number(test.price_iqd).toLocaleString("en") || 0}
            </Select.Option>
          ))}
        </Select>
      </Spin>

      {selectedTests.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">{t("Selected Tests")}:</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap size={8}>
              {selectedTests?.map((el, i) => (
                <div
                  className="px-4 py-2 rounded-[8px] bg-[#f6f6f6] flex gap-4"
                  key={i}
                >
                  <Text>{el?.title}</Text>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    type="text"
                    onClick={() => removeTest(el.id)}
                  />
                </div>
              ))}
            </Space>
            {/* <List
              dataSource={selectedTests}
              renderItem={(test) => (
                <List.Item
                  actions={[
                    <Button
                      key="remove"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeTest(test.name)}
                      size="small"
                      title={t("Remove test")}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Text>{test.name}</Text>
                        {test.isPrimary && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>
                            {t("Primary")}
                          </Tag>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
              style={{ maxHeight: 300, overflowY: "auto" }}
            /> */}
          </div>
        </div>
      )}
    </Modal>
  );
};

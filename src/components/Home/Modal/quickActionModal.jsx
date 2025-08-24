import React, { useState, useEffect } from "react";
import {
  Modal,
  List,
  Button,
  Typography,
  message,
  Spin,
  Select,
  Tag,
} from "antd";
import { StarOutlined, StarFilled, DeleteOutlined } from "@ant-design/icons";
import { useHomeStore } from "../../../libs/appStore";
import { useTranslation } from "react-i18next";
import { send } from "../../../control/renderer";

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
        data: { q: query, limit: 50, skip: 0 },
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

  const handleSelectChange = (selectedTestNames) => {
    const newSelectedTests = selectedTestNames.map((testName) => {
      // Keep existing isPrimary status if test was already selected
      const existingTest = selectedTests.find((test) => test.name === testName);
      return {
        name: testName,
        isPrimary: existingTest?.isPrimary || false,
      };
    });
    setSelectedTests(newSelectedTests);
  };

  const removeTest = (testName) => {
    setSelectedTests((prev) => prev.filter((test) => test.name !== testName));
  };

  const togglePrimaryStatus = (testName) => {
    setSelectedTests((prev) =>
      prev.map((test) =>
        test.name === testName ? { ...test, isPrimary: !test.isPrimary } : test
      )
    );
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
          mode="multiple"
          placeholder={t("Search and select tests...")}
          style={{ width: "100%", marginBottom: 16 }}
          value={selectedTests.map((test) => test.name)}
          onChange={handleSelectChange}
          showSearch
          filterOption={(input, option) =>
            option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          maxTagCount="responsive"
        >
          {tests.map((test) => (
            <Select.Option key={test.name} value={test.name}>
              {test.name} - {t("Price")}: {test.price || 0}
            </Select.Option>
          ))}
        </Select>
      </Spin>

      {selectedTests.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>{t("Selected Tests")}:</Text>
          <div style={{ marginTop: 8 }}>
            <List
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
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

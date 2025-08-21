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
  Select,
  Card,
  Form,
  Collapse,
  Tooltip,
} from "antd";
import { useAppStore, useTestStore, useTrigger } from "../../../libs/appStore";
import { send } from "../../../control/renderer";
import "./style.css";
import { useEffect, useRef, useState } from "react";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Text } = Typography;
const { Panel } = Collapse;

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
    type,
    setType,
    groupTest,
    setGroupTest,
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

  // New state for group tests
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingTest, setEditingTest] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // Initialize groups from groupTest if it exists
  useEffect(() => {
    if (type === "groupTest" && groupTest && groupTest !== "[]") {
      try {
        const parsedGroups = JSON.parse(groupTest);
        if (Array.isArray(parsedGroups)) {
          setGroups(parsedGroups);
        }
      } catch (error) {
        console.error("Error parsing groupTest:", error);
        setGroups([]);
      }
    } else {
      setGroups([]);
    }
  }, [type, groupTest]);

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

  // Group management functions
  const addGroup = () => {
    const newGroup = {
      id: Date.now(),
      name: "",
      tests: [],
      isEditing: true,
    };
    setGroups([...groups, newGroup]);
    setEditingGroup(newGroup.id);

    // Automatically expand the new group and close others
    const newExpanded = new Set();
    newExpanded.add(newGroup.id);
    setExpandedGroups(newExpanded);
  };

  const updateGroup = (groupId, field, value) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId ? { ...group, [field]: value } : group
      )
    );
  };

  const deleteGroup = (groupId) => {
    setGroups(groups.filter((group) => group.id !== groupId));
  };

  const addTestToGroup = (groupId) => {
    const newTest = {
      id: Date.now(),
      name: "",
      normal: "",
      isSelecte: false,
      options: [],
      isEditing: true,
    };

    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? { ...group, tests: [...group.tests, newTest] }
          : group
      )
    );
    setEditingTest(newTest.id);
  };

  const updateTestInGroup = (groupId, testId, field, value) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tests: group.tests.map((test) =>
                test.id === testId ? { ...test, [field]: value } : test
              ),
            }
          : group
      )
    );
  };

  const deleteTestFromGroup = (groupId, testId) => {
    setGroups(
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tests: group.tests.filter((test) => test.id !== testId),
            }
          : group
      )
    );
  };

  const handleTestIsSelecteChange = (groupId, testId, checked) => {
    // Consolidate all updates into a single state update
    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tests: group.tests.map((test) =>
                test.id === testId
                  ? {
                      ...test,
                      isSelecte: checked,
                      normal: checked ? "" : test.normal,
                      options: checked ? ["positive", "negative"] : [],
                    }
                  : test
              ),
            }
          : group
      )
    );
  };

  const addOptionToTest = (groupId, testId, option) => {
    const group = groups.find((g) => g.id === groupId);
    const test = group.tests.find((t) => t.id === testId);
    if (test && test.options.indexOf(option) === -1) {
      updateTestInGroup(groupId, testId, "options", [...test.options, option]);
    }
  };

  const removeOptionFromTest = (groupId, testId, option) => {
    const group = groups.find((g) => g.id === groupId);
    const test = group.tests.find((t) => t.id === testId);
    if (test) {
      const newOptions = test.options.filter((opt) => opt !== option);
      updateTestInGroup(groupId, testId, "options", newOptions);
    }
  };

  const saveGroup = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      if (group.name.trim()) {
        // If group has a name, save it
        updateGroup(groupId, "isEditing", false);
        setEditingGroup(null);
      } else {
        // If group name is empty, delete the group
        deleteGroup(groupId);
        // Clear expanded state
        const newExpanded = new Set(expandedGroups);
        newExpanded.delete(groupId);
        setExpandedGroups(newExpanded);
      }
    }
  };

  const saveTest = (groupId, testId) => {
    const group = groups.find((g) => g.id === groupId);
    const test = group.tests.find((t) => t.id === testId);
    if (test && test.name.trim()) {
      updateTestInGroup(groupId, testId, "isEditing", false);
      setEditingTest(null);
    }
  };

  const editGroup = (groupId) => {
    setEditingGroup(groupId);
    updateGroup(groupId, "isEditing", true);
  };

  const editTest = (groupId, testId) => {
    setEditingTest(testId);
    updateTestInGroup(groupId, testId, "isEditing", true);
  };

  const toggleGroupExpansion = (groupId) => {
    const newExpanded = new Set();
    // If the clicked group is not currently expanded, expand only this group
    // If it's already expanded, close it (keep set empty)
    if (!expandedGroups.has(groupId)) {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
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

    // If it's a group test, convert groups to text and save
    if (type === "groupTest") {
      // Filter out empty groups and tests
      const validGroups = groups
        .filter((group) => group.name.trim() && group.tests.length > 0)
        .map((group) => ({
          ...group,
          tests: group.tests.filter((test) => test.name.trim()),
        }));

      // Validate that we have at least one valid group
      if (validGroups.length === 0) {
        message.error(t("Please add at least one group with tests"));
        return;
      }

      // Validate that each group has at least one test
      const invalidGroups = validGroups.filter(
        (group) => group.tests.length === 0
      );
      if (invalidGroups.length > 0) {
        message.error(t("Each group must contain at least one test"));
        return;
      }

      // Convert to JSON string for SQLite storage
      data.groupTest = JSON.stringify(validGroups);
      data.type = "groupTest";
    } else {
      data.groupTest = "[]";
      data.type = "singleTest";
    }

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
      width={800}
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
            disabled={
              !name ||
              price === "" ||
              price === null ||
              (type === "groupTest" && groups.length === 0)
            }
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
          <Col span={12}>
            <Space style={{ width: "100%" }} direction="vertical" size={4}>
              <Text>{t("Type")}</Text>
              <Select
                value={type}
                onChange={(val) => setType(val)}
                options={[
                  {
                    label: t("SingleTest"),
                    value: "singleTest",
                  },
                  {
                    label: t("GroupTest"),
                    value: "groupTest",
                  },
                ]}
              />
            </Space>
          </Col>
        </Row>

        {type === "singleTest" ? (
          <>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space style={{ width: "100%" }} direction="vertical" size={4}>
                  <Text>{t("NormalValue")}</Text>
                  <Input.TextArea
                    value={normal}
                    onChange={(e) => setNormal(e.target.value)}
                    rows={2}
                    placeholder="Ex: Male (4.0-7.0) mg\dl, Female (3.0-5.5) mg\dl"
                    style={{ width: "100%", direction: "ltr" }}
                    disabled={isSelecte}
                  />
                </Space>
              </Col>
              <Col span={24}>
                <Space style={{ width: "100%" }} direction="vertical" size={4}>
                  <Checkbox
                    checked={isSelecte}
                    onChange={handleIsSelecteChange}
                  >
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
          </>
        ) : (
          <div
            className="h-[330px] overflow-y-auto p-2"
            style={{ marginTop: 16 }}
          >
            <Divider orientation="left">{t("GroupTests")}</Divider>

            {/* Compact Tags Row */}
            <div style={{ marginBottom: 16 }}>
              <Space size={[4, 8]} wrap>
                {groups.map((group) => (
                  <Tag
                    key={group.id}
                    color={expandedGroups.has(group.id) ? "blue" : "default"}
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      padding: "2px 6px",
                      margin: "2px",
                      userSelect: "none",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => toggleGroupExpansion(group.id)}
                  >
                    {group.name} ({group.tests.length})
                  </Tag>
                ))}

                {/* Add Group Button as Small Tag */}
                <Tag
                  style={{
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "2px 6px",
                    margin: "2px",
                    borderStyle: "dashed",
                    backgroundColor: "#fafafa",
                  }}
                  onClick={addGroup}
                >
                  <PlusOutlined style={{ fontSize: "10px" }} /> {t("AddGroup")}
                </Tag>
              </Space>

              {groups.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "16px",
                    color: "#999",
                    marginTop: 8,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {t("ClickAddGroupToStart")}
                  </Text>
                </div>
              )}
            </div>

            {/* Action Buttons for Selected Group */}
            {groups.some((group) => expandedGroups.has(group.id)) && (
              <div style={{ marginBottom: 12 }}>
                {groups
                  .filter((group) => expandedGroups.has(group.id))
                  .map((group) => (
                    <div
                      key={`actions-${group.id}`}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "4px",
                        marginBottom: 8,
                      }}
                    >
                      <Space
                        size="small"
                        style={{
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        {group.isEditing ? (
                          <Input
                            value={group.name}
                            onChange={(e) =>
                              updateGroup(group.id, "name", e.target.value)
                            }
                            placeholder="Enter group name"
                            onPressEnter={() => saveGroup(group.id)}
                            onBlur={() => saveGroup(group.id)}
                            autoFocus
                            style={{ width: "200px" }}
                          />
                        ) : (
                          <Text
                            strong
                            style={{ fontSize: "14px", color: "#1890ff" }}
                          >
                            {group.name || "Unnamed Group"}
                          </Text>
                        )}
                        <Space size="small">
                          <Tooltip title="Edit group name">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => editGroup(group.id)}
                            />
                          </Tooltip>
                          <Tooltip title="Delete group">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteGroup(group.id)}
                            />
                          </Tooltip>
                          <Button
                            type="primary"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addTestToGroup(group.id)}
                          >
                            {t("AddTest")}
                          </Button>
                        </Space>
                      </Space>
                    </div>
                  ))}
              </div>
            )}

            {/* Expandable Content */}
            {groups.map(
              (group) =>
                expandedGroups.has(group.id) && (
                  <div
                    key={`content-${group.id}`}
                    style={{
                      marginBottom: 16,
                      padding: "12px",
                      backgroundColor: "#fafafa",
                      border: "1px solid #e8e8e8",
                      borderRadius: "6px",
                      animation: "slideDown 0.3s ease-out",
                    }}
                  >
                    {group.tests.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: "16px",
                          color: "#999",
                        }}
                      >
                        <Text type="secondary">{t("NoTestsInGroup")}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {t("ClickAddTestToStart")}
                        </Text>
                      </div>
                    ) : (
                      group.tests.map((test) => (
                        <Card
                          key={test.id}
                          size="small"
                          style={{ marginBottom: 8 }}
                          title={
                            test.isEditing ? (
                              <Input
                                value={test.name}
                                onChange={(e) =>
                                  updateTestInGroup(
                                    group.id,
                                    test.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter test name"
                                onPressEnter={() => saveTest(group.id, test.id)}
                                onBlur={() => saveTest(group.id, test.id)}
                                autoFocus
                              />
                            ) : (
                              <Space>
                                <Text>{test.name}</Text>
                                <Tooltip title="Edit test name">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => editTest(group.id, test.id)}
                                  />
                                </Tooltip>
                                <Tooltip title="Delete test">
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() =>
                                      deleteTestFromGroup(group.id, test.id)
                                    }
                                  />
                                </Tooltip>
                                <div>
                                  <Checkbox
                                    checked={Boolean(test.isSelecte)}
                                    onChange={(e) => {
                                      handleTestIsSelecteChange(
                                        group.id,
                                        test.id,
                                        e.target.checked
                                      );
                                    }}
                                  >
                                    {t("IsSelect")}
                                  </Checkbox>
                                  <Text
                                    type="secondary"
                                    style={{
                                      fontSize: "10px",
                                      marginLeft: "8px",
                                    }}
                                  ></Text>
                                </div>
                              </Space>
                            )
                          }
                        >
                          <Row gutter={[16, 16]}>
                            <Col span={12}>
                              <Space
                                direction="vertical"
                                size={4}
                                style={{ width: "100%" }}
                              >
                                <Text type="secondary">{t("NormalValue")}</Text>
                                <Input.TextArea
                                  value={test.normal}
                                  onChange={(e) =>
                                    updateTestInGroup(
                                      group.id,
                                      test.id,
                                      "normal",
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  placeholder="Ex: Male (4.0-7.0) mg\dl, Female (3.0-5.5) mg\dl"
                                  disabled={test.isSelecte}
                                />
                              </Space>
                            </Col>
                            <Col span={12}>
                              <Space
                                direction="vertical"
                                size={4}
                                style={{ width: "100%" }}
                              ></Space>
                            </Col>
                            {test.isSelecte && (
                              <Col span={24}>
                                <Space
                                  direction="vertical"
                                  size={4}
                                  style={{ width: "100%" }}
                                >
                                  <Text type="secondary">{t("Options")}</Text>
                                  <Space size={[0, 6]} wrap>
                                    {test.options.map((option, index) => (
                                      <Tag
                                        key={index}
                                        closable
                                        color="blue"
                                        onClose={() =>
                                          removeOptionFromTest(
                                            group.id,
                                            test.id,
                                            option
                                          )
                                        }
                                      >
                                        {option}
                                      </Tag>
                                    ))}
                                    {inputVisible && editingTest === test.id ? (
                                      <Input
                                        ref={inputRef}
                                        type="text"
                                        size="small"
                                        style={tagInputStyle}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onBlur={() => {
                                          if (inputValue) {
                                            addOptionToTest(
                                              group.id,
                                              test.id,
                                              inputValue
                                            );
                                          }
                                          setInputVisible(false);
                                          setInputValue("");
                                        }}
                                        onPressEnter={() => {
                                          if (inputValue) {
                                            addOptionToTest(
                                              group.id,
                                              test.id,
                                              inputValue
                                            );
                                          }
                                          setInputVisible(false);
                                          setInputValue("");
                                        }}
                                      />
                                    ) : (
                                      <Tag
                                        style={tagPlusStyle}
                                        onClick={() => {
                                          setInputVisible(true);
                                          setEditingTest(test.id);
                                        }}
                                      >
                                        <PlusOutlined /> {t("NewOption")}
                                      </Tag>
                                    )}
                                  </Space>
                                </Space>
                              </Col>
                            )}
                          </Row>
                        </Card>
                      ))
                    )}
                  </div>
                )
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

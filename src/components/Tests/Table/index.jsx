import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Pagination,
  Popconfirm,
  Space,
  Table,
  message,
  Tag,
  Typography,
  Modal,
  Input,
} from "antd";
import "./style.css";
import dayjs from "dayjs";
import { send } from "../../../control/renderer";
import { useEffect, useState, useRef } from "react";
import { useAppStore, useTestStore, useTrigger } from "../../../libs/appStore";
import { useTranslation } from "react-i18next";
import usePageLimit from "../../../hooks/usePageLimit";
import { useAppTheme } from "../../../hooks/useAppThem";
import { formatRefText } from "../../../helper/refTextFormatter";
import { MetaJsonModal } from "./metaJsonModal";

export const PureTable = () => {
  const { isReload, setIsReload } = useAppStore();
  const { setIsModal, setInitialData, querySearch } = useTestStore();
  const [data, setData] = useState([]);
  const [isMetaModal, setIsMetaModal] = useState(false);
  const [record, setRecord] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isHideModalVisible, setIsHideModalVisible] = useState(false);
  const [allTests, setAllTests] = useState([]);
  const [selectedTestsToHide, setSelectedTestsToHide] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const [modalSearchText, setModalSearchText] = useState("");
  const timeoutRef = useRef(null);
  const limit = usePageLimit(65, 35);
  const { t } = useTranslation();
  const { setFlag, setTest } = useTrigger();
  const { appColors } = useAppTheme();

  // Get hidden test IDs from localStorage
  const getHiddenTestIds = () => {
    try {
      const hidden = localStorage.getItem("hiddenTestIds");
      return hidden ? JSON.parse(hidden) : [];
    } catch {
      return [];
    }
  };

  const columns = [
    {
      title: t("TestName"),
      dataIndex: "name_en",
      key: "name_en",
      render: (name_en, row) => (
        <div>
          <Typography.Text className="text-[14px] font-bold">
            {name_en}
          </Typography.Text>

          {row?.type !== "single" && (
            <Space size={2}>
              <Typography.Text className="ml-1">-</Typography.Text>
              <Typography.Text type="secondary" className="text-[12px]">
                {row?.name_ar}
              </Typography.Text>
            </Space>
          )}
        </div>
      ),
    },

    {
      title: t("View"),
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const colors = {
          single: "geekblue",
          panel: "magenta",
          composite: "purple",
        };

        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: t("Unit"),
      dataIndex: "unit",
      key: "unit",
      render: (unit) => (
        <Typography.Text type="secondary" className="text-[12px]">
          {unit}
        </Typography.Text>
      ),
    },
    {
      title: t("NormalValue"),
      dataIndex: "ref_text",
      key: "ref_text",
      render: (ref_text, record) => (
        <div className="max-w-[260px]">
          {formatRefText(ref_text, record?.unit)}
        </div>
      ),
    },

    {
      title: t("Sample"),
      dataIndex: "sample_type",
      key: "sample_type",
      render: (sample_type) => <Tag>{sample_type}</Tag>,
    },
    {
      title: t("Price"),
      dataIndex: "price_iqd",
      key: "price_iqd",
      render: (price_iqd) => (
        <b>{Number(price_iqd).toLocaleString("en")} IQD</b>
      ),
    },

    {
      title: t("LastUpdate"),
      dataIndex: "updated_at",
      key: "updated_at",
      render: (updated_at) => (
        <span style={{ color: "#666" }}>
          {dayjs(updated_at).add(3, "hour").format("DD/MM/YYYY hh:mm A")}
        </span>
      ),
    },

    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Space size="small" className="custom-actions">
          {record?.type !== "single" && (
            <Button
              size="small"
              //icon={<EditOutlined />}
              onClick={() => {
                setRecord(record);
                setIsMetaModal(true);
              }}
              type="primary"
            >
              Customize
            </Button>
          )}
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          ></Button>
          <Popconfirm
            title={t("DeleteTheRecord")}
            description={t("DeleteThisRecord")}
            onConfirm={() => handleRemove(record.id)}
            okText="Yes"
            cancelText="No"
            placement="leftBottom"
          >
            <Button danger size="small" icon={<DeleteOutlined />}></Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleRemove = (id) => {
    send({
      query: "deleteTest",
      id,
    })
      .then((resp) => {
        if (resp.success) {
          message.success(t("Testdeletedsuccessfully"));
          setIsReload(!isReload);
        } else {
          message.error(t("Failedtodeletetest"));
        }
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
        message.error("Failed to communicate with server.");
      });
  };

  const handleEdit = (row) => {
    setInitialData(row);
    setIsModal(true);
  };

  useEffect(() => {
    let queryKey = querySearch ? querySearch : "";

    setLoading(true);

    send({
      query: "getTests",
      data: { q: queryKey, skip: (page - 1) * limit, limit },
    })
      .then((resp) => {
        if (resp.success) {
          // Don't filter tests on the management page - show all tests
          setData(resp.data);
          setTotal(resp.total);
          setTest(resp.data);
          setFlag(true);
        } else {
          console.error("Error get tests:", resp.error);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error in IPC communication:", err);
      });
  }, [page, isReload, querySearch, limit]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Load all tests for the hide modal
  const loadAllTestsForModal = async () => {
    try {
      const resp = await send({
        query: "getTests",
        data: { q: "", skip: 0, limit: 10000 }, // Get all tests
      });
      if (resp.success) {
        setAllTests(resp.data);
        
        // Preselect tests that are already in localStorage
        const hiddenIds = getHiddenTestIds();
        if (hiddenIds.length > 0) {
          const testsToPreselect = resp.data.filter((test) =>
            hiddenIds.includes(test.id)
          );
          setSelectedTestsToHide(testsToPreselect);
        }
      }
    } catch (err) {
      console.error("Error loading all tests:", err);
    }
  };

  const handleResultsClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setClickCount((prevCount) => {
      const newCount = prevCount + 1;
      
      if (newCount >= 3) {
        // Load all tests and show modal
        loadAllTestsForModal();
        setIsHideModalVisible(true);
        setClickCount(0);
        return 0;
      } else {
        // Reset counter after 2 seconds if not reached 3
        timeoutRef.current = setTimeout(() => {
          setClickCount(0);
        }, 2000);
        return newCount;
      }
    });
  };

  const handleSaveHiddenTests = () => {
    // Save selected test IDs to localStorage (empty array means no tests are hidden)
    const testIds = selectedTestsToHide.map((test) => test.id);
    localStorage.setItem("hiddenTestIds", JSON.stringify(testIds));
    
    // Clear selection
    setSelectedTestsToHide([]);
    
    // Close modal
    setIsHideModalVisible(false);
    
    // Reload data
    setIsReload(!isReload);
    
    // Show appropriate message
    if (testIds.length === 0) {
      message.success(t("AllTestsUnhidden") || "All tests are now visible");
    } else {
      message.success(t("TestsHiddenSuccessfully") || "Tests hidden successfully");
    }
  };

  const handleCancelHideModal = () => {
    setIsHideModalVisible(false);
    setSelectedTestsToHide([]);
    setModalSearchText("");
  };

  const sendUpdateMetaJson = async (row) => {
    try {
      let resp = await send({
        query: "editMetaJson",
        id: record?.id,
        data: row,
      });


      if (resp.success) {
        setRecord(null);
        setIsMetaModal(false);
        setIsReload(!isReload);
        message.success("Updated.");
      }
    } catch (error) {
      message.error("ERROR!.");
      console.log(error);
    }
  };

  return (
    <>
      <Table
        style={{
          marginTop: 16,
          border: `1px solid ${appColors.colorBorder}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
        loading={loading}
        columns={columns}
        rowKey={(row) => row.id}
        dataSource={data}
        pagination={false}
        size="small"
        footer={() => (
          <div className="table-footer app-flex-space " style={{ position: "relative" }}>
            <div
              className="pattern-isometric pattern-indigo-400 pattern-bg-white 
  pattern-size-6 pattern-opacity-5 absolute inset-0 "
              style={{ pointerEvents: "none" }}
            ></div>
            <p
              onClick={handleResultsClick}
              style={{ userSelect: "none", position: "relative", zIndex: 1 }}
            >
              <b>{total}</b> {t("results")}
            </p>
            <Pagination
              className="flex flex-row justify-center items-center"
              simple
              current={page}
              onChange={(_page) => {
                setPage(_page);
              }}
              total={total}
              pageSize={limit}
              showSizeChanger={false}
            />
          </div>
        )}
      />

      <MetaJsonModal
        open={isMetaModal}
        type={record?.type} // "panel" | "composite" | "single"
        name={record?.name_en}
        initialMetaJson={record?.meta_json} // string أو object
        onCancel={() => setIsMetaModal(false)}
        onSubmit={sendUpdateMetaJson}
      />

      <Modal
        title={t("SelectTestsToHide") || "Select Tests to Hide"}
        open={isHideModalVisible}
        onCancel={handleCancelHideModal}
        footer={[
          <Button key="cancel" onClick={handleCancelHideModal}>
            {t("Cancel")}
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSaveHiddenTests}
          >
            {t("Save")}
          </Button>,
        ]}
        width={800}
      >
        <Input
          placeholder={t("SearchTest")}
          value={modalSearchText}
          onChange={(e) => setModalSearchText(e.target.value)}
          style={{ marginBottom: 16 }}
          allowClear
        />
        <Table
          rowSelection={{
            type: "checkbox",
            selectedRowKeys: selectedTestsToHide.map((test) => test.id),
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedTestsToHide(selectedRows || []);
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              setSelectedTestsToHide(selected ? (selectedRows || []) : []);
            },
          }}
          columns={[
            {
              title: t("TestName"),
              dataIndex: "name_en",
              key: "name_en",
              render: (name_en, row) => (
                <div>
                  <Typography.Text className="text-[14px] font-bold">
                    {name_en}
                  </Typography.Text>
                  {row?.type !== "single" && (
                    <Space size={2}>
                      <Typography.Text className="ml-1">-</Typography.Text>
                      <Typography.Text type="secondary" className="text-[12px]">
                        {row?.name_ar}
                      </Typography.Text>
                    </Space>
                  )}
                </div>
              ),
            },
            {
              title: t("View"),
              dataIndex: "type",
              key: "type",
              render: (type) => {
                const colors = {
                  single: "geekblue",
                  panel: "magenta",
                  composite: "purple",
                };
                return <Tag color={colors[type]}>{type}</Tag>;
              },
            },
            {
              title: t("Price"),
              dataIndex: "price_iqd",
              key: "price_iqd",
              render: (price_iqd) => (
                <b>{Number(price_iqd).toLocaleString("en")} IQD</b>
              ),
            },
          ]}
          rowKey={(row) => row.id}
          dataSource={allTests.filter((test) => {
            if (!modalSearchText) return true;
            const searchLower = modalSearchText.toLowerCase();
            return (
              test.name_en?.toLowerCase().includes(searchLower) ||
              test.name_ar?.toLowerCase().includes(searchLower) ||
              test.type?.toLowerCase().includes(searchLower)
            );
          })}
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </Modal>
    </>
  );
};

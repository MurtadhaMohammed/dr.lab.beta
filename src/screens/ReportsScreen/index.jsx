import {
  Button,
  Col,
  DatePicker,
  Divider,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Typography,
  Modal,
  Input,
} from "antd";
import "./style.css";
import { PureTable as HomeTable } from "../../components/Visits";
import dayjs from "dayjs";
import { send } from "../../control/renderer";
import { getTotalPrice } from "../../helper/price";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserOutlined } from "@ant-design/icons";
import { useAppStore } from "../../libs/appStore";

const ReportsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [status, setStatus] = useState(null);
  const [gender, setGender] = useState(null);
  const [testId, setTestId] = useState(null);
  const [testList, setTestList] = useState([]);
  const [filterDate, setFilterDate] = useState([dayjs(), dayjs()]);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { t } = useTranslation();
  const { printFontSize } = useAppStore();

  const loadData = (cb) => {
    send({
      query: "getVisits",
      data: {
        q: "",
        startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
        endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
        status,
        testId,
        gender,
      },
    }).then(({ success, data }) => {
      if (success) cb(data);
    });
  };
  const handlePrint = () => {
    loadData((rows) => {
      let _data = {
        date: [
          dayjs(filterDate[0]).format("YYYY-MM-DD"),
          dayjs(filterDate[1]).format("YYYY-MM-DD"),
        ],
        total: Number(data?.totalAmount || 0).toLocaleString("en"),
        subTotal: Number(data?.subTotalAmount || 0).toLocaleString("en"),
        discount: Number(data?.totalDiscount || 0).toLocaleString("en"),
        fontSize: printFontSize, // Add the font size to the data object
        records: rows?.map((record) => {
          let list = record.tests;
          const resolveTestName = (testItem) => {
            if (!testItem) return "";
            if (typeof testItem === "string") return testItem;
            if (record?.testType === "CUSTOME" && testItem?.name) {
              return testItem.name;
            }
            return (
              testItem?.title ||
              testItem?.name ||
              testItem?.name_en ||
              testItem?.name_ar ||
              testItem?.code ||
              ""
            );
          };

          const testsString = Array.isArray(list)
            ? list.map(resolveTestName).filter(Boolean).join(",")
            : "";

          return {
            name: record?.patient?.name,
            price: Number(getTotalPrice(record?.tests)).toLocaleString("en"),
            endPrice: Number(
              getTotalPrice(record?.tests) - record?.discount
            ).toLocaleString("en"),
            tests: testsString,
            discount: Number(record?.discount).toLocaleString("en"),
            createdAt: dayjs(record?.createdAt).format("YYYY/MM/DD"),
          };
        }),
      };

      send({
        query: "printReport",
        data: _data,
      }).then(({ err, res }) => {
        console.log(err, res);
      });
    });
  };

  // Load tests from database
  const loadTests = async (query = "") => {
    setLoading(true);
    try {
      const response = await send({
        query: "getTests",
        data: { q: query, limit: 1000, skip: 0 },
      });

      if (response.success) {
        setTestList(response.data || []);
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

  useEffect(() => {
    // Check if password is set in localStorage
    const reportsPassword = localStorage.getItem("reportsPassword");
    if (reportsPassword && reportsPassword.trim() !== "") {
      // Password exists, show modal
      setShowPasswordModal(true);
      setIsPasswordVerified(false);
    } else {
      // No password set, allow access
      setIsPasswordVerified(true);
      setShowPasswordModal(false);
    }
  }, []);

  useEffect(() => {
    // Only load data if password is verified or no password is set
    if (isPasswordVerified) {
      loadReports();
      loadTests();
    }
  }, [filterDate, status, gender, testId, isPasswordVerified]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const resp = await send({
        query: "getVisitTotals",
        data: {
          startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
          endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
          status,
          gender,
          testId,
        },
      });

      if (resp?.success) {
        setData(resp);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
      message.error("ERROR. !");
      setLoading(false);
    }
  };

  const homeTable = useMemo(
    () => (
      <HomeTable isReport filter={{ status, gender, filterDate, testId }} />
    ),
    [data, status, gender, filterDate, testId]
  );

  const handlePasswordSubmit = () => {
    if (!passwordInput.trim()) {
      message.error(t("PasswordRequired"));
      return;
    }

    const reportsPassword = localStorage.getItem("reportsPassword");
    if (passwordInput === reportsPassword) {
      setIsPasswordVerified(true);
      setShowPasswordModal(false);
      setPasswordInput("");
      message.success(t("PasswordCorrect"));
    } else {
      message.error(t("WrongPassword"));
      setPasswordInput("");
    }
  };

  const handlePasswordKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePasswordSubmit();
    }
  };

  return (
    <div className={`reports-screen page relative`}>
      {/* Header - Always visible, completely separate, never blurred */}
      <div className="border-none p-[2%]" style={{ paddingBottom: 0 }}>
        <section className="header app-flex-space mb-[18px]">
          <Space>
            <DatePicker.RangePicker
              allowClear={false}
              value={filterDate}
              onChange={setFilterDate}
            />
            <Divider type="vertical" />
            <Select
              placeholder="Visit Status"
              allowClear
              value={status}
              onChange={setStatus}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="PARTIAL">PARTIAL</Option>
              <Option value="COMPLETED">COMPLETED</Option>
            </Select>

            <Select
              placeholder="Gender"
              allowClear
              style={{ width: 140 }}
              value={gender}
              onChange={setGender}
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
            </Select>

            <Select
              placeholder={t("Select test")}
              style={{ width: "100%", minWidth: 120 }}
              onChange={setTestId}
              showSearch
              allowClear
              filterOption={(input, option) => {
                // console.log({input, option})
                return (
                  option?.key?.toLowerCase()?.indexOf(input.toLowerCase()) >= 0
                );
              }}
              //maxTagCount="responsive"
              popupMatchSelectWidth={false}
            >
              {testList?.map((test) => (
                <Select.Option key={test.name_en} value={test.id}>
                  {test.name_en} - {t("Price")}:{" "}
                  {Number(test.price_iqd).toLocaleString("en") || 0}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Space>
            <Button disabled={!data || !filterDate} onClick={handlePrint}>
              {t("Print")}
            </Button>
          </Space>
        </section>
      </div>
      
      {/* Content - Blurred when modal is open, completely separate container */}
      <div 
        className="border-none p-[2%]"
        style={{ 
          paddingTop: 0,
          filter: showPasswordModal ? "blur(5px)" : "none",
          pointerEvents: showPasswordModal ? "none" : "auto",
          transition: "filter 0.3s ease"
        }}
      >
        <Divider />
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              loading={loading}
              title={t("Totalvisits")}
              value={data?.totalVisits || 0}
              prefix={<UserOutlined />}
            />
          </Col>
          <Col span={6}>
            <Statistic
              loading={loading}
              title={t("SubTotalAmount")}
              value={data?.subTotalAmount || 0}
              precision={2}
              suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
            />
          </Col>
          <Col span={6}>
            <Statistic
              loading={loading}
              title={t("TotalDiscount")}
              value={data?.totalDiscount || 0}
              precision={2}
              suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
            />
          </Col>
          <Col span={6}>
            <Statistic
              loading={loading}
              title={t("TotalAmount")}
              value={data?.totalAmount || 0}
              precision={2}
              suffix={<Typography.Text type="secondary">IQD</Typography.Text>}
            />
          </Col>
        </Row>

        <div className="mt-6 mb-10">{isPasswordVerified && homeTable}</div>
      </div>
      {showPasswordModal && (
        <Modal
          title={t("EnterReportsPassword")}
          open={showPasswordModal}
          closable={false}
          maskClosable={false}
          footer={null}
          centered
          width={400}
          mask={false}
          wrapClassName="reports-password-modal"
        >
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Input.Password
                placeholder={t("Password")}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                onPressEnter={handlePasswordKeyPress}
                autoFocus
              />
              <Button
                type="primary"
                block
                onClick={handlePasswordSubmit}
                disabled={!passwordInput.trim()}
              >
                {t("Verify")}
              </Button>
            </Space>
          </Modal>
      )}
    </div>
  );
};

export default ReportsScreen;

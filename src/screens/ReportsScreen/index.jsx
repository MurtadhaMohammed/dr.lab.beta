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
          return {
            name: record?.patient?.name,
            price: Number(getTotalPrice(record?.tests)).toLocaleString("en"),
            endPrice: Number(
              getTotalPrice(record?.tests) - record?.discount
            ).toLocaleString("en"),
            tests: list
              .map((el) => el[record.testType === "CUSTOME" ? "name" : "title"])
              .join(","),
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
    loadReports();
    loadTests();
  }, [filterDate, status, gender, testId]);

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

  return (
    <div className={`reports-screen page relative`}>
      <div className="border-none  p-[2%]">
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

        <div className="mt-6 mb-10">{homeTable}</div>
      </div>
    </div>
  );
};

export default ReportsScreen;

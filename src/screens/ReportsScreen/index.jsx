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
import {  useReportsStore } from "../../libs/appStore";
import dayjs from "dayjs";
import { send } from "../../control/renderer";
import { getTotalPrice } from "../../helper/price";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserOutlined } from "@ant-design/icons";

const ReportsScreen = () => {
  const { filterDate, setFilterDate,visitStatus, setVisitStatus } = useReportsStore();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const { t } = useTranslation();

  const loadData = (cb) => {
    send({
      query: "getVisits",
      data: {
        q: "",
        startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
        endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
        status: visitStatus,
      },
    }).then(({ success, data }) => {
      if (success) cb(data);
    });
  };
  const handlePrint = () => {
    // Retrieve font size from localStorage or set a default value
    const fontSize = localStorage.getItem("lab-print-size") || 14; // Default to 14

    loadData((rows) => {
      let _data = {
        date: [
          dayjs(filterDate[0]).format("YYYY-MM-DD"),
          dayjs(filterDate[1]).format("YYYY-MM-DD"),
        ],
        total: Number(data?.totalAmount || 0).toLocaleString("en"),
        subTotal: Number(data?.subTotalAmount || 0).toLocaleString("en"),
        discount: Number(data?.totalDiscount || 0).toLocaleString("en"),
        fontSize, // Add the font size to the data object
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


  useEffect(() => {
    loadReports();
  }, [filterDate, visitStatus]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const resp = await send({
        query: "getVisitTotals",
        data: {
          startDate: dayjs(filterDate[0]).startOf("day").toISOString(),
          endDate: dayjs(filterDate[1]).endOf("day").toISOString(),
          status: visitStatus,
          gender: null,
          testId: null,
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

  const homeTable = useMemo(() => <HomeTable isReport />, [data, visitStatus]);

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
              value={visitStatus}
              onChange={setVisitStatus}
            >
              <Option value="PENDING">PENDING</Option>
              <Option value="PARTIAL">PARTIAL</Option>
              <Option value="COMPLETED">COMPLETED</Option>
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

import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  DownOutlined,
  EditOutlined,
  FundOutlined,
  TaobaoOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Typography,
  Input,
  Space,
  Col,
  Row,
  Card,
  Divider,
  Button,
  Dropdown,
  Radio,
  Spin,
} from "antd";
import "./style.css";
import { PureModal, ResultsModal } from "../../components/Visits";
import { PureTable } from "../../components/Home";
import { useHomeStore, useLanguage, useAppStore } from "../../libs/appStore";
const { Search } = Input;
import { useTranslation } from "react-i18next";
import { FiArrowLeft } from "react-icons/fi";
import { QuickActionsModal } from "../../components/Home/Modal/quickActionModal";
import { useEffect, useState } from "react";
import { send } from "../../control/renderer";

function CardStatistics({ icon, title, value, loading }) {
  return (
    <Card styles={{ body: { padding: "12px 18px" } }}>
      <Space align="center">
        <div className="w-[60px] h-[60px] rounded-[12px] bg-[#a343c91c] flex items-center justify-center">
          {icon}
        </div>
        <Divider type="vertical" />
        <div>
          <Typography.Text type="secondary">{title}</Typography.Text>
          {loading ? (
            <Spin size="small" />
          ) : (
            <b className="text-[32px] block">{value.toLocaleString()}</b>
          )}
        </div>
      </Space>
    </Card>
  );
}

function ActionBtn({ title, isPrimary, onClick }) {
  return (
    <Button
      className={"h-[100px] text-[16px] overflow-hidden text-ellipsis"}
      size="large"
      type={isPrimary ? "primary" : "default"}
      onClick={() => onClick({ key: title })}
      title={title} // Show full text on hover
    >
      <div className="overflow-hidden text-ellipsis whitespace-nowrap w-full">
        {title}
      </div>
    </Button>
  );
}

const HomeScreen = () => {
  const {
    setIsModal,
    testType,
    setTestType,
    setQuerySearch,
    id,
    setReset,
    setIsToday,
    isToday,
    selectedTest,
    setSelectedTest,
    setIsQuickActionsModal,
  } = useHomeStore();
  const { isReload } = useAppStore();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const { lang, setLang } = useLanguage();

  // Statistics state
  const [statistics, setStatistics] = useState({
    pendingResults: 0,
    todayVisits: 0,
    totalPatients: 0,
    totalVisits: 0,
  });
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // Fetch statistics function
  const fetchStatistics = async () => {
    setStatisticsLoading(true);
    try {
      const [pendingRes, todayRes, totalPatientsRes, totalVisitsRes] =
        await Promise.all([
          send({ query: "getPendingResults" }),
          send({ query: "getTodayVisits" }),
          send({ query: "getTotalPatients" }),
          send({ query: "getTotalVisits", data: {} }),
        ]);

      console.log("🔍 Frontend received responses:", {
        pendingRes,
        todayRes,
        totalPatientsRes,
        totalVisitsRes,
      });

      setStatistics({
        pendingResults: pendingRes.success ? pendingRes.total : 0,
        todayVisits: todayRes.success ? todayRes.total : 0,
        totalPatients: totalPatientsRes.success ? totalPatientsRes.total : 0,
        totalVisits: totalVisitsRes.success ? totalVisitsRes.total : 0,
      });

      console.log("✅ Frontend statistics set:", {
        pendingResults: pendingRes.success ? pendingRes.total : 0,
        todayVisits: todayRes.success ? todayRes.total : 0,
        totalPatients: totalPatientsRes.success ? totalPatientsRes.total : 0,
        totalVisits: totalVisitsRes.success ? totalVisitsRes.total : 0,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Fetch statistics on component mount and reload
  useEffect(() => {
    fetchStatistics();
  }, [isReload]);

  const handleLang = (val) => {
    const newLanguage = val.target.value;
    i18n.changeLanguage(newLanguage);
    setLang(newLanguage);
    document.documentElement.dir = newLanguage === "en" ? "ltr" : "rtl";
  };

  const onClick = ({ key }) => {
    // Always reset when clicking any quick action button
    setReset();
    setTestType("CUSTOME");
    if (key !== "Other Tests") {
      setSelectedTest(key);
    }
    setIsModal(true);
  };

  const actionButtonsRow = localStorage.getItem("actionButtons")
    ? JSON.parse(localStorage.getItem("actionButtons"))
    : [];

  // Filter out "Other Tests" from localStorage data since we'll add it statically
  const filteredActionButtons = actionButtonsRow.filter(
    (item) => item.name !== "Other Tests"
  );

  const actionButtons = [
    // Add other buttons from localStorage
    ...filteredActionButtons.map((item) => ({
      title: item.name,
      isPrimary: false,
      onClick: () => onClick({ key: item.name }),
    })),
    // Add static "Other Tests" button first
    {
      title: "Other Tests",
      isPrimary: true,
      onClick: () => onClick({ key: "Other Tests" }),
    },
  ];

  const items = [
    {
      key: "today",
      label: t("Today"),
    },
    {
      key: "all",
      label: t("All"),
    },
  ];

  const types = [
    {
      key: "PACKAGE",
      label: t("PackageTest"),
    },
    {
      key: "CUSTOME",
      label: t("CustomeTest"),
    },
  ];

  return (
    <div className="home-screen page pb-[50px]">
      <div className="border-none p-[2%]">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <CardStatistics
              title={t("Pending Results")}
              value={statistics.pendingResults}
              loading={statisticsLoading}
              icon={
                <ClockCircleOutlined className="text-[#a343c9] text-[28px]" />
              }
            />
          </Col>
          <Col span={6}>
            <CardStatistics
              title={t("Today's Visits")}
              value={statistics.todayVisits}
              loading={statisticsLoading}
              icon={
                <UsergroupAddOutlined className="text-[#a343c9] text-[28px]" />
              }
            />
          </Col>
          <Col span={6}>
            <CardStatistics
              title={t("Total Patients")}
              value={statistics.totalPatients}
              loading={statisticsLoading}
              icon={<UserOutlined className="text-[#a343c9] text-[28px]" />}
            />
          </Col>
          <Col span={6}>
            <CardStatistics
              title={t("Total Visits")}
              value={statistics.totalVisits}
              loading={statisticsLoading}
              icon={<FundOutlined className="text-[#a343c9] text-[28px]" />}
            />
          </Col>

          <Col span={16}>
            <Card
              styles={{ body: { padding: 0 } }}
              title={
                <div className="app-flex-space w-full font-normal">
                  <Typography.Text className="font-bold">
                    {t("Recent Visits")}
                  </Typography.Text>
                  <Space size={16}>
                    <Search
                      name="search"
                      placeholder={t("SearchPatient")}
                      onSearch={(val) => setQuerySearch(val)}
                      style={{
                        width: 270,
                      }}
                      className={`${direction === "rtl" ? "search-input" : ""}`}
                      dir={direction}
                    />
                  </Space>
                </div>
              }
            >
              <PureTable />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              title={
                <div className="app-flex-space w-full">
                  <Typography.Text>{t("Quick Actions")}</Typography.Text>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setIsQuickActionsModal(true)}
                  />
                </div>
              }
            >
              <div className={"grid grid-cols-3 gap-4"}>
                {actionButtons.map((button, index) => (
                  <ActionBtn
                    key={index}
                    title={button.title}
                    isPrimary={button.isPrimary}
                    onClick={onClick}
                  />
                ))}
              </div>
              <Divider />
              <Space wrap className="w-full app-flex-space">
                <Button type="primary" className="flex-1">
                  + New Patient
                </Button>
                {/* <Divider type="vertical" /> */}
                <Radio.Group defaultValue={lang} onChange={handleLang}>
                  <Radio.Button value="ar">عربي</Radio.Button>
                  <Radio.Button value="ku">کوردی</Radio.Button>
                  <Radio.Button value="en">English</Radio.Button>
                </Radio.Group>
              </Space>
            </Card>
          </Col>
        </Row>
        <PureModal />
        <ResultsModal />
        <QuickActionsModal />
      </div>
    </div>
  );
};

export default HomeScreen;

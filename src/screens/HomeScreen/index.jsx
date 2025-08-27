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
  Tag,
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
import { PDFSettings } from "../SettingScreen/pdfSettings";

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

// function ActionBtn({ title, onClick }) {
//   return (

//   );
// }

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

      setStatistics({
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

  const onClick = ({ key, id }) => {
    console.log("onClick", key, id);
    // Always reset when clicking any quick action button
    setReset();
    setTestType("CUSTOME");
    if (key !== "Other Tests") {
      setSelectedTest(id);
    }
    setIsModal(true);
  };

  const actionButtonsRow = localStorage.getItem("actionButtons")
    ? JSON.parse(localStorage.getItem("actionButtons"))
    : [];

  const actionButtons = [
    // Add other buttons from localStorage
    ...actionButtonsRow.map((item) => ({
      title: item.name_en,
      id: item.id,
      isPrimary: false,
      onClick: () => onClick({ key: item.name, id: item.id }),
    })),
    // Add static "Other Tests" button first
    {
      title: "Other Tests",
      isPrimary: true,
      onClick: () => onClick({ key: "Other Tests", id: null }),
    },
  ];


  return (
    <div className="home-screen page pb-[50px]">
      <div className="border-none p-[2%]">
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <div className="grid grid-cols-3 gap-4">
              <CardStatistics
                title={t("Pending Results")}
                value={statistics.pendingResults}
                loading={statisticsLoading}
                icon={
                  <ClockCircleOutlined className="text-[#a343c9] text-[28px]" />
                }
              />
              <CardStatistics
                title={t("Today's Visits")}
                value={statistics.todayVisits}
                loading={statisticsLoading}
                icon={
                  <UsergroupAddOutlined className="text-[#a343c9] text-[28px]" />
                }
              />
              <CardStatistics
                title={t("Total Patients")}
                value={statistics.totalPatients}
                loading={statisticsLoading}
                icon={<UserOutlined className="text-[#a343c9] text-[28px]" />}
              />
            </div>
            <Card
              className="mt-4"
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
              //className="bg-gradient-to-r from-[#f6f6f6] to-[#f6f6f64c]"
              // className="bg-[#f6f6f6]"
              styles={{
                title: {
                  fontSize: 14,
                  fontWeight: "normal",
                  opacity: 0.8,
                },
              }}
              title={
                <div className="app-flex-space w-full">
                  <Typography.Text>{t("Common Tests")}</Typography.Text>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setIsQuickActionsModal(true)}
                  />
                </div>
              }
            >
              <Space wrap size={12}>
                {actionButtons.map((button, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-md bg-[#f6f6f6] shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    style={
                      button.isPrimary
                        ? { background: "#9053e7", color: "#fff" }
                        : {}
                    }
                    onClick={() =>
                      onClick({ key: button.title, id: button.id })
                    }
                  >
                    {button?.title}
                  </div>
                ))}
              </Space>
            </Card>

            <Card
              styles={{
                title: {
                  fontSize: 14,
                  fontWeight: "normal",
                  opacity: 0.8,
                },
              }}
              className="mt-4"
              title={
                <div className="app-flex-space w-full">
                  <Typography.Text>{t("Quick Settings")}</Typography.Text>
                </div>
              }
            >
              <PDFSettings />
              <Divider />

              <div className="mt-4 bg-[#f6f6f6] p-4 rounded-[8px]">
                <Space size={12} wrap>
                  <Button className="flex-1">+ New Patient</Button>
                  <Button className="flex-1">+ New Doctor</Button>
                  <Radio.Group defaultValue={lang} onChange={handleLang}>
                    <Radio.Button value="ar">عربي</Radio.Button>
                    <Radio.Button value="ku">کوردی</Radio.Button>
                    <Radio.Button value="en">English</Radio.Button>
                  </Radio.Group>
                </Space>
              </div>
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

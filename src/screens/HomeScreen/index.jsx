import {
  ArrowRightOutlined,
  DownOutlined,
  EditOutlined,
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
} from "antd";
import "./style.css";
import { PureTable, PureModal, ResultsModal } from "../../components/Home";
import { useHomeStore, useLanguage } from "../../libs/appStore";
const { Search } = Input;
import { useTranslation } from "react-i18next";
import { FiArrowLeft } from "react-icons/fi";

function CardStatistics({ icon, title, value }) {
  return (
    <Card styles={{ body: { padding: "12px 18px" } }}>
      <Space align="center">
        <div className="w-[60px] h-[60px] rounded-[12px] bg-[#a343c91c] flex items-center justify-center">
          {icon}
        </div>
        <Divider type="vertical" />
        <div>
          <Typography.Text type="secondary">{title}</Typography.Text>
          <b className="text-[32px] block">{value}</b>
        </div>
      </Space>
    </Card>
  );
}

function ActionBtn({ title, isPrimary }) {
  return (
    <Button
      className={"h-[100px] text-[16px] whitespace-pre-wrap"}
      size="large"
      type={isPrimary ? "primary" : "default"}
    >
      {title}
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
  } = useHomeStore();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const { lang, setLang } = useLanguage();

  const handleLang = (val) => {
    const newLanguage = val.target.value;
    i18n.changeLanguage(newLanguage);
    setLang(newLanguage);
    document.documentElement.dir = newLanguage === "en" ? "ltr" : "rtl";
  };

  const onClick = ({ key }) => {
    (id || testType !== key) && setReset();
    setTestType(key);
    setIsModal(true);
  };
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
              title="Pending Results"
              value="23"
              icon={<i className="fa-solid fa-vial"></i>}
            />
          </Col>
          <Col span={6}>
            <CardStatistics
              title="Today's Visits"
              value="75"
              icon={<i className="fa-solid fa-vial"></i>}
            />
          </Col>
          <Col span={6}>
            <CardStatistics
              title="Total Patients"
              value="1,500"
              icon={<i className="fa-solid fa-user-group"></i>}
            />
          </Col>
          <Col span={6}>
            <CardStatistics
              title="Total Visits"
              value="1,200"
              icon={<i className="fa-solid fa-file-medical"></i>}
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
          <Col span={8} >   
            <Card
              title={
                <div className="app-flex-space w-full">
                  <Typography.Text>{t("Quick Actions")}</Typography.Text>
                  <Button size="small" icon={<EditOutlined />} />
                </div>
              }
            >
              <div className={"grid grid-cols-3 gap-4"}>
                <ActionBtn title={"Torch"} />
                <ActionBtn title={"Urine \n Culture"} />
                <ActionBtn title={"Stool \n Culture"} />
                <ActionBtn title={"Blood \n Culture"} />
                <ActionBtn title={"Sputum+"} />
                <ActionBtn title={"SFA"} />
                <ActionBtn title={"GUE"} />
                <ActionBtn title={"HVS"} />
                <ActionBtn title={"GSE"} />
                <ActionBtn title={"CBC"} />
                <ActionBtn title={"V. D3"} />
                <ActionBtn isPrimary title={"Other Tests"} />
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
      </div>
    </div>
  );
};

export default HomeScreen;

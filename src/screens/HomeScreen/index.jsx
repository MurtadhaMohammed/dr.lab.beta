import { DownOutlined } from "@ant-design/icons";
import { Button, Input, Space, Dropdown } from "antd";
import "./style.css";
import { PureTable, PureModal, ResultsModal } from "../../components/Home";
import { useHomeStore } from "../../libs/appStore";
const { Search } = Input;
import { useTranslation } from "react-i18next";

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
        <section className="header app-flex-space mb-[22px]">
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
            <span>
              {t("RequestListFor")}{" "}
              <Dropdown
                menu={{
                  items,
                  onClick: ({ key }) => {
                    if (key === "today") setIsToday(true);
                    else if (key === "all") setIsToday(false);
                  },
                }}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <Space align="center">
                    <b>{isToday ? t("Today") : t("All")}</b>
                    <DownOutlined style={{ fontSize: 13 }} />
                  </Space>
                </a>
              </Dropdown>
            </span>
          </Space>

          <Dropdown
            menu={{
              items: types,
              onClick,
            }}
          >
            <Button type="primary" onClick={(e) => e.preventDefault()}>
              + {t("CreateTest")}
            </Button>
          </Dropdown>
        </section>
        <PureTable />
        <PureModal />
        <ResultsModal />
      </div>
    </div>
  );
};

export default HomeScreen;

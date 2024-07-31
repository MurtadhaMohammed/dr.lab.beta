import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Input, Space, Dropdown, message } from "antd";
import "./style.css";
import { PureTable, PureModal, ResultsModal } from "../../components/Home";

import { useHomeStore } from "../../appStore";
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
  const { t } = useTranslation();

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
    <div className="home-screen page">
      <div className="border-none h-screen p-[2%]">
        <section className="header app-flex-space mb-[18px]">
          <Space size={16}>
            <Search
              placeholder={t("SearchPatient")}
              onSearch={(val) => setQuerySearch(val)}
              style={{
                width: 280,
              }}
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
                <a
                  style={{ color: "#000" }}
                  onClick={(e) => e.preventDefault()}
                >
                  <Space align="center">
                    <b>{isToday ? "Today" : "All"}</b>
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
            <Button type="link" onClick={(e) => e.preventDefault()}>
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

import { DownOutlined } from "@ant-design/icons";
import { Button, Input, Space, Dropdown } from "antd";
import "./style.css";
import { PureTable, PureModal, ResultsModal } from "../../components/Visits";
import { useHomeStore } from "../../libs/appStore";
const { Search } = Input;
import { useTranslation } from "react-i18next";

const VisitsScreen = () => {
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

  return (
    <div className="visits-screen page pb-[50px]">
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

          <Button type="primary" onClick={(e) => setIsModal(true)}>
            + {t("CreateTest")}
          </Button>
        </section>
        <PureTable />
        <PureModal />
        <ResultsModal />
      </div>
    </div>
  );
};

export default VisitsScreen;

import { Button, Card, Divider, Input, Space } from "antd";
import "./style.css";
import { PureModal, PureTable } from "../../components/Tests";
import { useTestStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
import useLang from "../../hooks/useLang";

const { Search } = Input;

const TestsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = useTestStore();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();

  return (
    <div className="tests-screen page">
      <div className="border-none  p-[2%]">
        <section className="header app-flex-space">
          <Search
            placeholder={t("SearchTest")}
            onSearch={(val) => setQuerySearch(val)}
            style={{
              width: 280,
            }}
            className={`${direction === "rtl" ? "search-input" : ""}`}
            dir={direction}
          />

          <Space>
            <Button
              type="primary"
              onClick={() => {
                id && setReset();
                setIsModal(true);
              }}
            >
              + {t("NewTest")}
            </Button>
          </Space>
        </section>

        <PureTable />
        <PureModal />
      </div>
    </div>
  );
};

export default TestsScreen;

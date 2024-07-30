import { Button, Card, Divider, Input, Space } from "antd";
import "./style.css";
import { PureModal, PureTable } from "../../components/Tests";
import { useTestStore } from "../../appStore";
import { useTranslation } from "react-i18next";

const { Search } = Input;

const TestsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = useTestStore();
  const { t } = useTranslation();
  return (
    <div className="tests-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Search
            placeholder={t("SearchTest")}
            onSearch={(val) => setQuerySearch(val)}
            style={{
              width: 280,
            }}
          />

          <Space>
            <Button
              type="link"
              onClick={() => {
                id && setReset();
                setIsModal(true);
              }}
            >
              + {t("NewTest")}
            </Button>
          </Space>
        </section>
        <Divider />
        <PureTable />
        <PureModal />
      </Card>
    </div>
  );
};

export default TestsScreen;

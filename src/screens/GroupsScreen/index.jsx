import { Button, Card, Divider, Input, Space } from "antd";
import "./style.css";
import { PureModal, PureTable } from "../../components/Groups";
import { useGroupStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";

const { Search } = Input;

const GroupsScreen = () => {
  const { t, i18n } = useTranslation();
  const { setIsModal, setQuerySearch, id, setReset } = useGroupStore();

  const direction = i18n.dir();

  return (
    <div className="group-screen page">
      <Card
        className="border-none"
        styles={{
          body: {
            padding: "2%",
          },
        }}
      >
        <section className="header app-flex-space mb-[18px]">
          <Search
            placeholder={t("SearchGroup")}
            onSearch={(val) => setQuerySearch(val)}
            style={{
              width: 280,
            }}
            className={`${direction === "rtl" ? "search-input" : ""}`}
            dir={direction}
          />

          <Space>
            <Button
              type="link"
              onClick={() => {
                id && setReset();
                setIsModal(true);
              }}
            >
              + {t("NewGroup")}
            </Button>
          </Space>
        </section>
        <PureTable />
        <PureModal />
      </Card>
    </div>
  );
};

export default GroupsScreen;

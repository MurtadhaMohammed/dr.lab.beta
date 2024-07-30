import { Button, Card, Divider, Input, Space } from "antd";
import "./style.css";
import { PureModal, PureTable } from "../../components/Groups";
import { useGroupStore } from "../../appStore";
import { useTranslation } from "react-i18next";


const { Search } = Input;

const GroupsScreen = () => {
  const { t } = useTranslation();
  const { setIsModal, setQuerySearch, id, setReset } = useGroupStore();
  return (
    <div className="group-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Search
            placeholder={t("SearchGroup")}
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
              + {t("NewGroup")}
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

export default GroupsScreen;

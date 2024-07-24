import { Button, Card, Divider, Input, Space } from "antd";
import "./style.css";
import { PureModal, PureTable } from "../../components/Groups";
import { useGroupStore } from "../../appStore";

const { Search } = Input;

const GroupsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = useGroupStore();
  return (
    <div className="group-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Search
            placeholder="Search Group"
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
              + New Group
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

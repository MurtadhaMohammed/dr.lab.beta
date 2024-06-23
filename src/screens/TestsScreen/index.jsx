import { Button, Card, Divider, Input, Space } from "antd";
import "./style.css";
import { PureModal, PureTable } from "../../components/Tests";
import { useTestStore } from "../../appStore";

const { Search } = Input;

const TestsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = useTestStore();
  return (
    <div className="tests-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Search
            placeholder="Search Test"
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
              + New Test
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

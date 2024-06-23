import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Input, Space, Dropdown, message } from "antd";
import "./style.css";
import { PureTable, PureModal, ResultsModal } from "../../components/Home";

import { useHomeStore } from "../../appStore";

const { Search } = Input;

const items = [
  {
    key: "today",
    label: "Today",
  },
  // {
  //   key: "2",
  //   label: "Last Week",
  // },
  // {
  //   key: "3",
  //   label: "Last Month",
  // },
  {
    key: "all",
    label: "All",
  },
];

const types = [
  {
    key: "PACKAGE",
    label: "Package Test",
  },
  {
    key: "CUSTOME",
    label: "Custome Test",
  },
];

const HomeScreen = () => {
  const {
    setIsModal,
    testType,
    setTestType,
    setQuerySearch,
    id,
    setReset,
    setIsToday,
    isToday
  } = useHomeStore();

  const onClick = ({ key }) => {
    (id || testType !== key) && setReset();
    setTestType(key);
    setIsModal(true);
  };

  return (
    <div className="home-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Space size={16}>
            <Search
              placeholder="Search patient"
              onSearch={(val) => setQuerySearch(val)}
              style={{
                width: 280,
              }}
            />
            <Divider type="vertical" />
            <span>
              Request list for{" "}
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
              + Create Test
            </Button>
          </Dropdown>
        </section>
        <Divider />
        <PureTable />
        <PureModal />
        <ResultsModal />
  
      </Card>
    </div>
  );
};

export default HomeScreen;

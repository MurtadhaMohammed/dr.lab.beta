import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Input, Space, Dropdown } from "antd";
import "./style.css";
import { PatientHistory, PureModal, PureTable } from "../../components/Patients";
import { usePatientStore } from "../../appStore";

const { Search } = Input;

const PatientsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = usePatientStore();
  return (
    <div className="patients-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Space size={16}>
            <Search
              placeholder="Search patient"
              onSearch={setQuerySearch}
              style={{
                width: 280,
              }}
            />
            {/* <Divider type="vertical" />
            <span>
              Patient list for{" "}
              <Dropdown
                menu={{
                  items,
                }}
                
              >
                <a style={{color: '#000'}} onClick={(e) => e.preventDefault()}>
                  <Space align="center">
                    <b>Today</b>
                    <DownOutlined style={{ fontSize: 13 }} />
                  </Space>
                </a>
              </Dropdown>
            </span> */}
          </Space>

          <Space>
            <Button
              type="link"
              onClick={() => {
                id && setReset();
                setIsModal(true);
              }}
            >
              + New Patient
            </Button>
          </Space>
        </section>
        <Divider />
        <PureTable />
        <PureModal />
        <PatientHistory/>
      </Card>
    </div>
  );
};

export default PatientsScreen;

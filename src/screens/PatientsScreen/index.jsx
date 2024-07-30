import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Input, Space, Dropdown } from "antd";
import "./style.css";
import { PatientHistory, PureModal, PureTable } from "../../components/Patients";
import { usePatientStore } from "../../appStore";
import { useTranslation } from "react-i18next";
const { Search } = Input;


const PatientsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = usePatientStore();
  const { t } = useTranslation();
  return (
    <div className="patients-screen">
      <Card bodyStyle={{ padding: 16 }}>
        <section className="header app-flex-space">
          <Space size={16}>
            <Search
              placeholder={t("SearchPatient")}
              onSearch={setQuerySearch}
              style={{
                width: 280,
              }}
            />
            <Button
              type="link"
              onClick={() => {
                id && setReset();
                setIsModal(true);
              }}
            >
              + {t("NewPatient")}
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

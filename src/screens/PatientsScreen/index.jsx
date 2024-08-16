import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Input, Space, Dropdown } from "antd";
import "./style.css";
import {
  PatientHistory,
  PureModal,
  PureTable,
} from "../../components/Patients";
import { usePatientStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
const { Search } = Input;

const PatientsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = usePatientStore();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();

  return (
    <div className="patients-screen page">
      <div className="border-none  p-[2%]">
        <section className="header app-flex-space mb-[18px]">
          <Space size={16}>
            <Search
              placeholder={t("SearchPatient")}
              onSearch={setQuerySearch}
              style={{
                width: 280,
              }}
              className={`${direction === "rtl" ? "search-input" : ""}`}
              dir={direction}
            />
          </Space>
          <Button
            type="link"
            onClick={() => {
              id && setReset();
              setIsModal(true);
            }}
          >
            + {t("NewPatient")}
          </Button>
        </section>
        <PureTable />
        <PureModal />
        <PatientHistory />
      </div>
    </div>
  );
};

export default PatientsScreen;

import { Button, Input, Space } from "antd";
import "./style.css";
import { useDoctorStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
import { PureModal, PureTable } from "../../components/Doctors";
const { Search } = Input;

const DoctorsScreen = () => {
  const { setIsModal, setQuerySearch, id, setReset } = useDoctorStore();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();

  return (
    <div className="patients-screen page">
      <div className="border-none  p-[2%]">
        <section className="header app-flex-space mb-[18px]">
          <Space size={16}>
            <Search
              placeholder={t("SearchDoctor")}
              onSearch={setQuerySearch}
              style={{
                width: 280,
              }}
              className={`${direction === "rtl" ? "search-input" : ""}`}
              dir={direction}
            />
          </Space>
          <Button
            type="primary"
            onClick={() => {
              id && setReset();
              setIsModal(true);
            }}
          >
            + {t("NewDoctor")}
          </Button>
        </section>
        <PureTable />
        <PureModal />
      </div>
    </div>
  );
};

export default DoctorsScreen;

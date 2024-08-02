import "./style.css";
import { HiOutlineHome } from "react-icons/hi2";
import { MdOutlinePersonalInjury } from "react-icons/md";
import { useState } from "react";
import { Alert, Button, Divider, Layout, Menu, Space, theme } from "antd";
import { TbReportSearch } from "react-icons/tb";
import { GrDocumentTest } from "react-icons/gr";
import { LuPackage2, LuSettings2 } from "react-icons/lu";
import { IoMdLogOut } from "react-icons/io";
import { RxDoubleArrowRight } from "react-icons/rx";
import { motion } from "framer-motion";


import { useTranslation } from "react-i18next";
import logo1 from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";
import { useNavigate, useLocation } from "react-router-dom";


const { Sider, Content } = Layout;

const MainContainerV2 = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout className="h-screen">
      <Sider
        style={{ background: "#f6f6f6" }}
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={164}
      >
        <div
          className="flex flex-col justify-between"
          style={{
            height: "calc(100% - 40px)",
          }}
        >
          <div>
            <div className="mt-[30px] font-bold text-[18px] flex justify-center mb-[30px]">
              <motion.div
                key={collapsed}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {collapsed ? (
                  <img className="w-[28px]" src={logo1} />
                ) : (
                  <img className="w-[110px]" src={logo2} />
                )}
              </motion.div>
            </div>
            <Menu
              style={{ border: "none" }}
              className="bg-transparent p-[8px]"
              mode="inline"
              defaultSelectedKeys={[location?.pathname]}
              items={[
                {
                  key: "/",
                  icon: <HiOutlineHome size={20} />,
                  label: <p className="text-[15px]">{t("Home")}</p>,
                  onClick: () => navigate("/", { replace: true }),
                },
                {
                  key: "/patients",
                  icon: <MdOutlinePersonalInjury size={20} />,
                  label: <p className="text-[15px]">{t("Patients")}</p>,
                  onClick: () => navigate("/patients", { replace: true }),
                },
                {
                  key: "/tests",
                  icon: <GrDocumentTest size={16} />,
                  label: <p className="text-[15px]">{t("Tests")}</p>,
                  onClick: () => navigate("/tests", { replace: true }),
                },
                {
                  key: "/package",
                  icon: <LuPackage2 size={18} />,
                  label: <p className="text-[15px]">{t("Package")}</p>,
                  onClick: () => navigate("/groups", { replace: true }),
                },
                {
                  key: "/reports",
                  icon: <TbReportSearch size={20} />,
                  label: <p className="text-[15px]">{t("Reports")}</p>,
                  onClick: () => navigate("/reports", { replace: true }),
                },
                {
                  key: "/settings",
                  icon: <LuSettings2 size={19} />,
                  label: <p className="text-[15px]">{t("Settings")}</p>,
                  onClick: () => navigate("/settings", { replace: true }),
                },
              ]}
            />
          </div>
          <div className="w-full grid">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="border-t border-t-[#eee] h-[48px] flex items-center gap-2 text-[#eb2f96] justify-center text-[22px] transition-all active:opacity-40"
            >
              <IoMdLogOut />
              {!collapsed && <p className="text-[15px]">{t("SignOut")}</p>}
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="border-t border-t-[#eee] h-[48px] flex items-center justify-center text-[22px] transition-all active:opacity-40"
            >
              <RxDoubleArrowRight
                className="transition-all "
                style={{
                  transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                }}
              />
            </button>
          </div>
        </div>
      </Sider>

      <Content
        style={{
          background: colorBgContainer,
          borderRadius: 0,
          overflow: "auto",
          width: "100%",
        }}
      >
        <Alert
          className="sticky top-0 z-10"
          message={t("SerialKeyWilBeExpiredSoon")}
          banner
          closable
        />
        {children}
      </Content>
    </Layout>

  );
};

export default MainContainerV2;

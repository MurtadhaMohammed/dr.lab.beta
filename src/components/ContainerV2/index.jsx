import "./style.css";
import { useEffect, useState } from "react";
import { HiOutlineHome } from "react-icons/hi2";
import { MdOutlinePersonalInjury } from "react-icons/md";
import {
  Alert,
  Button,
  message,
  Divider,
  Layout,
  Menu,
  Space,
  theme,
  Popconfirm,
  Popover,
} from "antd";
import { TbReportSearch } from "react-icons/tb";
import { GrDocumentTest } from "react-icons/gr";
import { LuPackage2, LuSettings2 } from "react-icons/lu";
import { IoMdLogOut } from "react-icons/io";
import { RxDoubleArrowRight } from "react-icons/rx";
import { motion } from "framer-motion";
import { useAppStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
import logo1 from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";
import { useNavigate, useLocation } from "react-router-dom";
import PopOverContent from "../../screens/SettingScreen/PopOverContent";

const { Sider, Content } = Layout;

const MainContainerV2 = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [signoutLoading, setSignoutLoading] = useState(false);
  const [showTrialAlert, setShowTrialAlert] = useState(false);
  const [showExpAlert, setShowExpAlert] = useState(false);
  const [remainingDays, setRemainingDays] = useState(null);
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(); // Use useTranslation to get the current language
  const { setIsLogin } = useAppStore();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const signout = async () => {
    setSignoutLoading(true);
    try {
      let serialId = parseInt(localStorage.getItem("lab-serial-id"));
      const resp = await fetch(
        `https://dr-lab-apiv2.onrender.com/api/app/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serialId }),
        }
      );
      if (resp.status === 200) {
        setSignoutLoading(false);
        localStorage.removeItem("lab-exp");
        localStorage.removeItem("lab-serial-id");
        localStorage.removeItem("lab-user");
        setIsLogin(false);
      } else message.error("Serial not found!");
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setSignoutLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage?.getItem("lab-user"));
    const labExp = parseInt(localStorage?.getItem("lab-exp"), 10);

    if (userData?.type === "trial") {
      setShowTrialAlert(true);
    }

    if (!isNaN(labExp) && labExp <= 3) {
      setRemainingDays(labExp);
      setShowExpAlert(true);
    }
  }, []);

  const showPopover = () => {
    setIsPopoverVisible(true);
  };

  const handlePopoverCancel = () => {
    setIsPopoverVisible(false);
  };

  // Function to determine rotation based on language
  const getRotationStyle = () => {
    if (i18n.language === "ar") {
      // Arabic language: rotate -90 degrees if collapsed
      return collapsed ? "rotate(-180deg)" : "rotate(0deg)";
    } else {
      // Other languages: default rotation
      return collapsed ? "rotate(0deg)" : "rotate(180deg)";
    }
  };

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
              style={{
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
              className="bg-transparent p-[8px]"
              mode="inline"
              defaultSelectedKeys={[location?.pathname]}
              items={[
                {
                  key: "/",
                  icon: <HiOutlineHome size={20} style={{ marginLeft: '2px' }}/>,
                  label: <p className="text-[15px]">{t("Home")}</p>,
                  onClick: () => navigate("/", { replace: true }),
                },
                {
                  key: "/patients",
                  icon: <MdOutlinePersonalInjury size={18} style={{ marginLeft: '1px' }}  />,
                  label: <p className="text-[15px]">{t("Patients")}</p>,
                  onClick: () => navigate("/patients", { replace: true }),
                },
                {
                  key: "/tests",
                  icon: <GrDocumentTest size={16} style={{ marginRight: '2px' }} />,
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
                  icon: <TbReportSearch size={18} />,
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
            <Popconfirm
              onConfirm={signout}
              title={t("SignoutConfirm")}
              description={t("SignOutFormThisApp")}
            >
              <button
                onClick={() => signoutLoading}
                className="border-t border-t-[#eee] h-[48px] flex items-center gap-2 text-[#eb2f96] justify-center text-[22px] transition-all active:opacity-40"
              >
                <IoMdLogOut />
                {!collapsed && <p className="text-[15px]">{t("SignOut")}</p>}
              </button>
            </Popconfirm>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="border-t border-t-[#eee] h-[48px] flex items-center justify-center text-[22px] transition-all active:opacity-40"
            >
              <RxDoubleArrowRight
                className="transition-all"
                style={{
                  transform: getRotationStyle(), // Apply the conditional rotation here
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
        {showTrialAlert && (
          <Alert
            className="sticky top-0 z-10"
            message={
              <span>
                {t("SerialKeyWilBeExpiredSoon")}{t("")}
                <Popover
                  placement="bottom"
                  visible={isPopoverVisible}
                  onVisibleChange={(visible) => setIsPopoverVisible(visible)}
                  trigger="hover"
                  content={<PopOverContent />}
                >
                  <a
                    onMouseEnter={showPopover}
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                  >
                    {t("here")}
                  </a>
                </Popover>
              </span>
            }
            banner
            closable
          />
        )}
        {showExpAlert && (
          <Alert
            className="sticky top-0 z-10"
            message={
              <span>
                {`${t("SerialKeyWillBeExpiredIn")} ${remainingDays} ${t(
                  "days"
                )}`}{" "}
                <Popover
                  placement="bottom"
                  title={t("")}
                  visible={isPopoverVisible}
                  onVisibleChange={(visible) => setIsPopoverVisible(visible)}
                  trigger="hover"
                  content={<PopOverContent />}
                >
                  <span>{t("upgrade")}</span>{" "}
                  <a
                    onMouseEnter={showPopover}
                    style={{ textDecoration: "underline", cursor: "pointer" }}
                  >
                    {t("here")}
                  </a>
                </Popover>
              </span>
            }
            banner
            closable
          />
        )}
        {children}
      </Content>
    </Layout>
  );
};

export default MainContainerV2;

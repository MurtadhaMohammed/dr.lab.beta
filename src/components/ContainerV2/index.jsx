import "./style.css";
import { HiOutlineHome } from "react-icons/hi2";
import { MdOutlinePersonalInjury } from "react-icons/md";
import { Button, Divider, Layout, Menu, Space, theme } from "antd";
import { useState } from "react";
import { TbReportSearch } from "react-icons/tb";
import { GrDocumentTest } from "react-icons/gr";
import { LuPackage2, LuSettings2 } from "react-icons/lu";
import { IoMdLogOut } from "react-icons/io";
import { RxDoubleArrowRight } from "react-icons/rx";
import { motion } from "framer-motion";
import { HiMiniXMark, HiMinusSmall } from "react-icons/hi2";
import { MdOutlineFullscreenExit } from "react-icons/md";

import logo1 from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";
import { useNavigate, useLocation } from "react-router-dom";
const { ipcRenderer } = window.require("electron");

const { Sider, Content } = Layout;

const MainContainerV2 = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <div>
      <header
        id="title-bar"
        className="h-[40px] bg-[#fff] border-b border-b-[#eee] flex items-center justify-between px-[16px]"
      >
        <Space>
          <img
            className="w-[60px]"
            style={{
              filter: "brightness(0.5)",
            }}
            src={logo2}
          />
          <Divider type="vertical" />
          <span className="text-[14px] text-[#a5a5a5]">v1.0.0-beta</span>
        </Space>
        <div id="title-bar-buttons">
          <Space align="center">
            <Button
              type="text"
              size="small"
              onClick={() => ipcRenderer.send("maximize-window")}
              icon={<MdOutlineFullscreenExit size={16} />}
            />
            <Button
              type="text"
              size="small"
              onClick={() => ipcRenderer.send("minimize-window")}
              icon={<HiMinusSmall size={20} />}
            />
            <Button
              onClick={() => ipcRenderer.send("close-window")}
              type="text"
              size="small"
              icon={<HiMiniXMark size={18} />}
            />
          </Space>
        </div>
      </header>
      <Layout className="h-screen">
        <Sider
          style={{ background: "#f6f6f6" }}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={164}
        >
          <div className="h-full flex flex-col justify-between">
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
                    label: <p className="text-[15px]">Home</p>,
                    onClick: () => navigate("/", { replace: true }),
                  },
                  {
                    key: "/patients",
                    icon: <MdOutlinePersonalInjury size={20} />,
                    label: <p className="text-[15px]">Patients</p>,
                    onClick: () => navigate("/patients", { replace: true }),
                  },
                  {
                    key: "/tests",
                    icon: <GrDocumentTest size={16} />,
                    label: <p className="text-[15px]">Tests</p>,
                    onClick: () => navigate("/tests", { replace: true }),
                  },
                  {
                    key: "/package",
                    icon: <LuPackage2 size={18} />,
                    label: <p className="text-[15px]">Package</p>,
                    onClick: () => navigate("/groups", { replace: true }),
                  },
                  {
                    key: "/reports",
                    icon: <TbReportSearch size={20} />,
                    label: <p className="text-[15px]">Reports</p>,
                    onClick: () => navigate("/reports", { replace: true }),
                  },
                  {
                    key: "/settings",
                    icon: <LuSettings2 size={19} />,
                    label: <p className="text-[15px]">Settings</p>,
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
                {!collapsed && <p className="text-[15px]">Sign Out</p>}
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
          {children}
        </Content>
      </Layout>
    </div>
  );
};

export default MainContainerV2;

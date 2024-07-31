import "./style.css";
import { HiOutlineHome } from "react-icons/hi2";
import { MdOutlinePersonalInjury } from "react-icons/md";
import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import {  TbReportSearch } from "react-icons/tb";
import { GrDocumentTest } from "react-icons/gr";
import { LuPackage2, LuSettings2 } from "react-icons/lu";
import { IoMdLogOut } from "react-icons/io";
import { RxDoubleArrowRight } from "react-icons/rx";
import { motion } from "framer-motion";

import logo1 from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";

const { Sider, Content } = Layout;



const MainContainerV2 = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);

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
              className="bg-transparent"
              mode="inline"
              defaultSelectedKeys={["home"]}
              items={[
                {
                  key: "home",
                  icon: <HiOutlineHome size={20} />,
                  label: <p className="text-[15px]">Home</p>,
                },
                {
                  key: "patients",
                  icon: <MdOutlinePersonalInjury size={20} />,
                  label: <p className="text-[15px]">Patients</p>,
                },
                {
                  key: "tests",
                  icon: <GrDocumentTest size={16} />,
                  label: <p className="text-[15px]">Tests</p>,
                },
                {
                  key: "package",
                  icon: <LuPackage2 size={18} />,
                  label: <p className="text-[15px]">Package</p>,
                },
                {
                  key: "reports",
                  icon: <TbReportSearch size={20} />,
                  label: <p className="text-[15px]">Reports</p>,
                },
                {
                  key: "settings",
                  icon: <LuSettings2 size={19} />,
                  label: <p className="text-[15px]">Settings</p>,
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
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default MainContainerV2;

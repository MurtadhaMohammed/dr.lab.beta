import "./style.css";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { HiOutlineHome } from "react-icons/hi2";
import { MdOutlinePersonalInjury } from "react-icons/md";
import { Layout, Menu, theme } from "antd";
import { useState } from "react";
import { TbArrowRightToArc, TbReportSearch } from "react-icons/tb";
import { GrDocumentTest } from "react-icons/gr";
import { LuPackage2, LuSettings2 } from "react-icons/lu";
import logo1 from "../../assets/logo.png";
import logo2 from "../../assets/logo2.png";

const { Sider, Content } = Layout;

const MainContainerV2 = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
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
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            <div className="mt-[30px] font-bold text-[18px] flex justify-center mb-[30px]">
              {collapsed ? <img className="w-[34px]" src={logo1} /> : <img  className="w-[120px]" src={logo2} />}
            </div>
            <Menu
              // theme="light"
              style={{ border: "none" }}
              className="bg-transparent"
              mode="inline"
              defaultSelectedKeys={["home"]}
              items={[
                {
                  key: "home",
                  icon: <HiOutlineHome size={18} />,
                  label: "Home",
                },
                {
                  key: "patients",
                  icon: <MdOutlinePersonalInjury size={18.5} />,
                  label: "Patients",
                },
                {
                  key: "tests",
                  icon: <GrDocumentTest size={14} />,
                  label: "Tests",
                },
                {
                  key: "package",
                  icon: <LuPackage2 size={16} />,
                  label: "Package",
                },
                {
                  key: "reports",
                  icon: <TbReportSearch size={18} />,
                  label: "Reports",
                },
                {
                  key: "settings",
                  icon: <LuSettings2 size={16} />,
                  label: "Settings",
                },
              ]}
            />
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="border-t border-t-[#eee] h-[48px] flex items-center justify-center text-[22px] transition-all active:opacity-40"
          >
            <TbArrowRightToArc
              className="transition-all "
              style={{
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            />
          </button>
        </div>
      </Sider>
      <Content
        style={{
          padding: 0,
          background: colorBgContainer,
          borderRadius: 0,
        }}
      >
        {children}
      </Content>
    </Layout>
  );
};

export default MainContainerV2;

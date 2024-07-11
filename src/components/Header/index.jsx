import MainContainer from "../Container";
import { UserOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space, Spin, message } from "antd";

import "./style.css";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAppStore } from "../../appStore";

const items = [
  {
    key: "signout",
    danger: true,
    label: "Signout",
    icon: <LogoutOutlined />,
  },
];

const MainHeader = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { setIsLogin } = useAppStore();

  const signout = async () => {
    setLoading(true);
    try {
      let id = localStorage.getItem("lab-id");
      const resp = await fetch(`https://lab-beta-api.onrender.com/api/signout/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await resp.json();
      setLoading(false);
      if (data.success) {
        localStorage.removeItem("lab-exp");
        localStorage.removeItem("lab-id");
        setIsLogin(false);
      } else message.error("Serial not found!");
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setLoading(false);
    }
  };

  return (
    <header className="main-header">
      <div className="shadow"></div>
      <MainContainer>
        <div className="menu">
          <div className="nav">
            <h4 className="logo">Dr.Lab</h4>
            <ul>
              <Link to={"/"}>
                <li className={location?.pathname === "/" ? "active" : ""}>
                  Home
                </li>
              </Link>
              <Link to={"/patients"}>
                <li
                  className={location?.pathname === "/patients" ? "active" : ""}
                >
                  Patients
                </li>
              </Link>
              <Link to={"/tests"}>
                <li className={location?.pathname === "/tests" ? "active" : ""}>
                  Tests
                </li>
              </Link>
              <Link to={"/groups"}>
                <li
                  className={location?.pathname === "/groups" ? "active" : ""}
                >
                  Packages
                </li>
              </Link>
              <Link to={"/reports"}>
                <li
                  className={location?.pathname === "/reports" ? "active" : ""}
                >
                  Reports
                </li>
              </Link>

              <Link to={"/settings"}>
                <li
                  className={location?.pathname === "/settings" ? "active" : ""}
                >
                  Settings
                </li>
              </Link>
            </ul>
          </div>
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === "signout") signout();
              },
            }}
            disabled={loading}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space align="center">
                {loading ? (
                  <Spin size="small" style={{ marginTop: "-6px" }} />
                ) : (
                  <DownOutlined style={{ fontSize: 14 }} />
                )}
                <span style={{ color: loading ? "#ccc" : "#000" }}>Admin</span>
                <Avatar size={"small"} icon={<UserOutlined />} />
              </Space>
            </a>
          </Dropdown>
        </div>
      </MainContainer>
    </header>
  );
};

export default MainHeader;

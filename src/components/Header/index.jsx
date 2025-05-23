import React, { useState, useEffect } from "react";
import { UserOutlined, DownOutlined, LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space, Spin, message } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../../libs/appStore";
import { useTranslation } from "react-i18next";
import MainContainer from "../Container";
import "./style.css";
import { stringify } from "postcss";
import { URL } from "../../libs/api";

const items = [
  {
    key: "signout",
    danger: true,
    label: "Signout",
    icon: <LogoutOutlined />,
  },
];

const MainHeader = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { setIsLogin, user } = useAppStore();

  useEffect(() => {
    const dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
  }, [i18n.language]);

  const signout = async () => {
    setLoading(true);
    try {
      let serial = localStorage.getItem("lab-serial"); 
      const resp = await fetch(
        `${URL}/app/logout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ serial }),
        }
      );
      if (resp.status === 200) {
        setLoading(false);
        localStorage.clear()
        setIsLogin(false);
      }
      //  else message.error(t(Serialnotfound));
    } catch (error) {
      console.log(error);
      message.error(error.message);
      setLoading(false);
    }
  };

  return (
    <header
      className="main-header"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="shadow"></div>
      <MainContainer>
        <div className="menu">
          <div className="nav">
            <h4 className="logo">Dr.Lab</h4>
            <ul>
              <Link to={"/"}>
                <li className={location?.pathname === "/" ? "active" : ""}>
                  {t("home")}
                </li>
              </Link>
              <Link to={"/patients"}>
                <li
                  className={location?.pathname === "/patients" ? "active" : ""}
                >
                  {t("Patients")}
                </li>
              </Link>
              <Link to={"/tests"}>
                <li className={location?.pathname === "/tests" ? "active" : ""}>
                  {t("Tests")}
                </li>
              </Link>
              <Link to={"/groups"}>
                <li
                  className={location?.pathname === "/groups" ? "active" : ""}
                >
                  {t("Packages")}
                </li>
              </Link>
              <Link to={"/reports"}>
                <li
                  className={location?.pathname === "/reports" ? "active" : ""}
                >
                  {t("Reports")}
                </li>
              </Link>
              <Link to={"/settings"}>
                <li
                  className={location?.pathname === "/settings" ? "active" : ""}
                >
                  {t("Settings")}
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
                <span style={{ color: loading ? "#ccc" : "#000" }}>
                  {user?.name || "Admin"}
                </span>
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

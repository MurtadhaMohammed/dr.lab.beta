import { Button, Divider, Space } from "antd";
import { HiMiniXMark, HiMinusSmall } from "react-icons/hi2";
import { MdOutlineFullscreenExit } from "react-icons/md";
import logo2 from "../../assets/logo2.png";
const { ipcRenderer } = window.require("electron");
import packageJson from "../../../package.json";
import "./style.css";
import { useAppStore } from "../../libs/appStore";
import { useAppTheme } from "../../hooks/useAppThem";
import { useTranslation } from "react-i18next";
import darkLogoName from "../../assets/dark-name.png";
import lightLogoName from "../../assets/light-name.png";

const TiteBar = () => {
  const { isOnline } = useAppStore();
  const { appColors, appTheme } = useAppTheme();
  const { i18n } = useTranslation();


  const renderLogo = () => {
    if (appTheme === "dark") {
      return <img className="w-[42px] mt-[4px]" src={darkLogoName} />;
    } else if (appTheme === "light") {
      return <img className="w-[42px] mt-[4px]" src={lightLogoName} />;
    }
  };
  return (
    <header
      id="title-bar"
      className="h-[40px]  border-b  flex items-center justify-between px-[16px] handlebar"
      style={{
        backgroundColor: appColors?.bgColor,
        borderColor: appColors.colorBorder,
        direction: i18n.language === "en" ? "ltr" : "rtl",
      }}
    >
      <Space>
       {renderLogo()}
        <Divider type="vertical" />
        <span className="text-[14px] text-[#a5a5a5]">
          v{packageJson.version}-beta
        </span>
        <div className={isOnline ? "online" : ""}></div>
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
  );
};

export default TiteBar;

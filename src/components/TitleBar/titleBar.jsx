import { Button, Divider, Space } from "antd";
import { HiMiniXMark, HiMinusSmall } from "react-icons/hi2";
import { MdOutlineFullscreenExit } from "react-icons/md";
import logo2 from "../../assets/logo2.png";
const { ipcRenderer } = window.require("electron");

const TiteBar = () => {
  return (
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
  );
};

export default TiteBar
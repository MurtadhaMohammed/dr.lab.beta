import React from "react";
import WorldWideIcon from "./WorldWideIcon";
import EmailIcon from "./EmailIcon";
import { PhoneOutlined } from "@ant-design/icons";
import Logo from "../../assets/logo2.png";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import "./style.css";

const PopOverContent = ({ website, email, phone }) => {
  const { t } = useTranslation();
  const direction = i18n.dir();

  return (
    <div className={`flex flex-col gap-4 pb-2`}>
      <div className="w-full px-10 py-2">
        <img src={Logo} alt="logo" className="w-full h-10" />
      </div>
      <h1 className="px-2 font-semibold">{t("contact_us_to_subscribe")}:</h1>
      <div className={`handleContact ${direction === 'rtl' ? 'rtl' : 'ltr'}`}>
        <div className="w-full flex items-center gap-2 px-2  text-sm">
          <WorldWideIcon />
          <a href={website || "https://google.com"} target="_blank" rel="noopener noreferrer">
            {website.substring(8) || "https://google.com"}
          </a>
        </div>
        <div className="w-full flex items-center gap-2 px-2  text-sm mt-3">
          <EmailIcon />
          <p href={email || "dr.lab@lab.com"} onClick={() => window.location = `mailto:${email}`} className=" hover:cursor-pointer hover:text-blue-700">
            {email || "dr.lab@lab.com"}
          </p>
        </div>
        <div className="w-full flex items-center gap-2 px-2  text-sm mt-3">
          <PhoneOutlined rotate={-46} />
          <p href={phone || "0770000000"}>
            {phone || "0770000000"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PopOverContent;

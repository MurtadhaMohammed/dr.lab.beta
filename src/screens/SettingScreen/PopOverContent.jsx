import React from 'react'
import WorldWideIcon from './WorldWideIcon'
import EmailIcon from './EmailIcon'
import { PhoneOutlined } from '@ant-design/icons'
import Logo from "../../assets/logo2.png";
import { useTranslation } from 'react-i18next';

const PopOverContent = ({ website, email, phone }) => {
    const { t } = useTranslation();

    return (
        <div className=" flex flex-col gap-4 pb-2">
            <div className="w-full px-10 py-2">
                <img src={Logo} alt="logo" className="w-full h-10" />
            </div>
            <h1 className="px-2 font-semibold">{t("contact_us_to_subscribe")}:</h1>
            <div className="w-full flex items-center gap-2 px-2 rtl:flex-row-reverse text-sm">
                <WorldWideIcon />
                <a href="/" target="blank">{website || "https://google.com"}</a>
            </div>
            <div className="w-full flex items-center gap-2 px-2 rtl:flex-row-reverse text-sm">
                <EmailIcon />
                <a href="/" target="blank">{email || "dr.lab@lab.com"}</a>
            </div>
            <div className="w-full flex items-center gap-2 px-2 rtl:flex-row-reverse text-sm">
                <PhoneOutlined rotate={-46} />
                <a href="/" target="blank">{phone || "0770000000"}</a>
            </div>
        </div>
    )
}

export default PopOverContent
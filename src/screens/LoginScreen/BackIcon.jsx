import { LeftCircleFilled, LeftCircleOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const BackIcon = ({ onClose }) => {
    const [flag, setFlag] = useState(false);
    const { t } = useTranslation();

    const handleButton = () => {
        const IconComponent = flag ? LeftCircleFilled : LeftCircleOutlined;

        return (
            <IconComponent
                className={`text-black hover:cursor-pointer rtl:transform rtl:rotate-180 `}
                onMouseEnter={() => !flag && setFlag(true)}
                onMouseLeave={() => flag && setFlag(false)}
                onClick={() => onClose()}
            />
        );
    }

    return (
        <div className="flex gap-2 h-full justify-start items-center">
            <Avatar
                className="bg-white flex justify-start items-center max-w-7"
                size={48}
                icon={handleButton()}
            />
            <p>{t("AddYourInfo")}</p>
        </div>
    );
}

export default BackIcon;
import { LeftCircleFilled, LeftCircleOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import React, { useState } from 'react';

const BackIcon = ({ onClose }) => {
    const [flag, setFlag] = useState(false);

    const handleButton = () => {
        return flag ? <LeftCircleFilled className="text-black hover:cursor-pointer" onMouseLeave={() => setFlag(false)} onClick={() => onClose()} /> : <LeftCircleOutlined className="text-black hover:cursor-pointer" onMouseEnter={() => setFlag(true)} />
    }

    return (
        <div className="flex gap-2 h-full justify-start items-center">
            <Avatar
                className="bg-white justify-start items-center max-w-7"
                size={48}
                icon={handleButton()}
            />
            <p>Add Your Info</p>
        </div>
    );
}

export default BackIcon;

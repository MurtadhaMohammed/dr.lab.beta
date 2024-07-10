import React, { useState } from 'react';
import "./style.css";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { IoClose } from "react-icons/io5";
import MainContainer from "../../components/Container/index"

const SettingsScreen = () => {
    return (
        <MainContainer >
            <div className="card-settings">

                <div className="top">
                    <div className='profile'>
                        <Avatar size={"large"} icon={<UserOutlined />} />
                        <span style={{ color: "#857979", fontSize: "20px" }}>Admin</span>
                    </div>
                    <div className='close' >
                        <IoClose />
                    </div>
                </div>
                <div className='form'>
                    <input type="text" placeholder="Your Name" className='input_1' />
                    <input type="text" placeholder="Email account" className='input_2' />
                    <input type="text" placeholder="Mobile number " className='input_3' />
                    <input type="text" placeholder="Time of purchase" className='input_4' />
                </div>

                <button className='btn'>
                    Save Change
                </button>
            </div>
        </MainContainer>
    );
}

export default SettingsScreen;

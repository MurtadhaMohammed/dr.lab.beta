import React, { useEffect, useState } from 'react'
import { send } from '../control/renderer';

const useInitHeaderImage = () => {
    const [success, setSuccess] = useState(null);

    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:3009/head.png");
            if (response.status === 200) {
                setSuccess(true)
            } else {
                setSuccess(false);
            }
        } catch (e) {
            console.log(e);
            setSuccess(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!success) {
            send({
                query: "initHeadImage",
            }).then(({ err, res }) => {
                console.log(err, res);
            });
        }
    }, [success]);

    return null;
}

export default useInitHeaderImage
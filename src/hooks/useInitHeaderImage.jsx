import React, { useEffect, useState } from 'react'
import { send } from '../control/renderer';

const useInitHeaderImage = () => {
    const [success, setSuccess] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch("http://localhost:3001/head.png");
            if (response.ok) {
                setSuccess(true)
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
                query: "checkInitHeadImage",
            }).then(({ err, res }) => {
                console.log(err, res);
            });
        }
    }, [success]);

    return { a: null }
}

export default useInitHeaderImage
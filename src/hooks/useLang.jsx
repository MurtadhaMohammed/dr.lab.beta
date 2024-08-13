import { useEffect } from 'react'
import i18n from '../i18n';
import { useLanguage } from '../libs/appStore';

const useLang = () => {
    const { lang } = useLanguage();

    console.log(lang);

    useEffect(() => {
        i18n.changeLanguage(lang);

        return () => {
            document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
        }
    }, [lang]);

    return { lang }
}

export default useLang
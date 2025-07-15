import { useEffect } from "react";
import { create } from "zustand";

export const colors = {
  light: {
    bgColor: "#fff",
    colorText: "#000",
    colorBorder: "#eee",
    colorPrimary: "#9053E7",
    colorPrimaryHover: "#9053E71a",
    colorError: "#eb2f96",
    colorLink: "#0000ff",
    sideMenuBg: "#f6f6f6",
    userWarning: "#ffcf6f",
  },
  dark: {
    bgColor: "#141414",
    colorText: "#fff",
    colorBorder: "#303030",
    colorPrimary: "#9053E7",
    colorPrimaryHover: "#9053E71a",
    colorError: "#eb2f96",
    colorLink: "#6d96ff",
    sideMenuBg: "#000",
    userWarning: "#d8961457",
  },
};

const useThemeState = create((set) => ({
  appTheme: "light",
  setAppTheme: (appTheme) => set({ appTheme }),
}));

export const useAppTheme = () => {
  const { appTheme, setAppTheme } = useThemeState();
  const appColors = colors[appTheme];

  useEffect(() => {
    const _appTheme = localStorage.getItem("appTheme");
    if (_appTheme) setAppTheme(_appTheme);
  }, []);

  const changeAppTheme = () => {
    if (appTheme === "light") {
      setAppTheme("dark");
      localStorage.setItem("appTheme", "dark");
    } else {
      setAppTheme("light");
      localStorage.setItem("appTheme", "light");
    }
  };

  return { appTheme, changeAppTheme, appColors };
};

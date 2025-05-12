import { useEffect } from "react";
import { create } from "zustand";

export const colors = {
  light: {
    bgColor: "#fff",
    colorText: "#000",
    colorBorder: "#eee",
    colorPrimary: "#4d6bfe",
    colorPrimaryHover: "#4d6bfe1a",
    colorError: "#eb2f96",
    colorLink: "#0000ff",
    sideMenuBg: "#f6f6f6",
  },
  dark: {
    bgColor: "#141414",
    colorText: "#fff",
    colorBorder: "#303030",
    colorPrimary: "#4d6bfe",
    colorPrimaryHover: "#4d6bfe1a",
    colorError: "#eb2f96",
    colorLink: "#6d96ff",
    sideMenuBg: "#000",
  },
};

const useThemeState = create((set) => ({
  appTheme: "dark",
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

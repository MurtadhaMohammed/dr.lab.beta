import { send } from "../control/renderer";
import { useAppStore } from "../libs/appStore";

const useInitHeaderImage = () => {
  const { setImagePath } = useAppStore();

  const loadImage = async () => {
    try {
      const res = await fetch("http://localhost:3009/head.png");
      if (!res.ok) return;
      return res.url;
    } catch (err) {
      // Local asset server unreachable (e.g. port already taken by another
      // instance) — fall through to generateHeader instead of throwing.
      console.error("Failed to reach local image server:", err);
      return null;
    }
  };

  const fetchHeader = async (user) => {
    const imageURL = await loadImage();
    if (imageURL) setImagePath(imageURL);
    else {
      try {
        await generateHeader(user);
      } catch (err) {
        console.error("Failed to generate or load image:", err);
      }
    }
  };

  const generateHeader = async (user) => {
    if (!user) return Promise.reject("No user provided");

    await send({
      query: "initHeadImage2",
      labName: user.labName || "...",
      phone: user.phone || "...",
      address: user.address || "...",
    });
    setImagePath(null);
    setTimeout(async () => {
      const imageURL = await loadImage();
      setImagePath(imageURL);
    }, 500);
  };

  return { generateHeader, fetchHeader, loadImage };
};

export default useInitHeaderImage;

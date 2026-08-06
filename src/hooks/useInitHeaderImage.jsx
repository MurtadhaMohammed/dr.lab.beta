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

  const fetchHeader = async () => {
    const imageURL = await loadImage();
    if (imageURL) setImagePath(imageURL);
    else await getDefaultHeader();
  };

  const getDefaultHeader = async () => {
    try {
      await send({
        query: "initHeadImage",
      });
      setImagePath(null);
      setTimeout(async () => {
        const imageURL = await loadImage();
        setImagePath(imageURL);
      }, 500);
    } catch (error) {
      console.log(error);
    }
  };

  return { fetchHeader, loadImage };
};

export default useInitHeaderImage;

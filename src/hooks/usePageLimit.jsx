import { useState, useEffect } from "react";

function usePageLimit(itemHeight = 82, offset = 65) {
  const [pageLimit, setPageLimit] = useState(() => {
    if (typeof window !== "undefined") {
      const screenHeight = window.innerHeight;
      return Math.floor((screenHeight - offset) / itemHeight);
    }
    return 10; // Default value if window is not defined
  });

  useEffect(() => {
    const calculatePageLimit = () => {
      const screenHeight = window.innerHeight;
      const limit = Math.floor((screenHeight - offset) / itemHeight);
      setPageLimit(limit);
    };

    // Calculate the page limit when the component mounts
    calculatePageLimit();

    // Update the page limit when the window is resized
    window.addEventListener("resize", calculatePageLimit);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("resize", calculatePageLimit);
    };
  }, [itemHeight, offset]); // Dependencies to re-run the effect if itemHeight or offset changes

  return pageLimit;
}

export default usePageLimit;

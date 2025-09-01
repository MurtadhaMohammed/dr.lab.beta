

export const getTotalPrice = (tests) => {
  // Parse the tests if it's a JSON string
  if (typeof tests === "string") {
    try {
      tests = JSON.parse(tests);
    } catch (error) {
      console.error("Failed to parse tests:", error);
      return 0;
    }
  }

  //total price record for visit
  let totalPrice = tests?.map((el) => el?.price_iqd)?.reduce((a, b) => a + b, 0);

  return totalPrice || 0;
};

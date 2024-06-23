export const getEndPrice = (price = 0, discount = 0, discountType = "%") => {
  let totalDiscount = 0;
  if (discount) {
    if (discountType === "%") {
      totalDiscount = price * (discount / 100);
    } else if (discountType === "#") {
      totalDiscount = discount;
    }
  }

  let endPrice = price - totalDiscount;
  return endPrice;
};

export const getPrice = (type, record) => {
  //price record for visit
  let totalPrice = 0;
  if (type === "CUSTOME") {
    totalPrice = record?.price;
  } else if (type === "PACKAGE" && record?.customePrice) {
    totalPrice = record?.customePrice;
  } else if (type === "PACKAGE" && !record?.customePrice) {
    totalPrice = record?.tests
    ?.map((el) => el?.price)
    ?.reduce((a, b) => a + b, 0);
  }

  return totalPrice || 0;
};

export const getTotalPrice = (type, tests) => {
  //total price record for visit
  let totalPrice = tests
    .map((el) => getPrice(type, el))
    ?.reduce((a, b) => a + b, 0);
  return totalPrice || 0;
};

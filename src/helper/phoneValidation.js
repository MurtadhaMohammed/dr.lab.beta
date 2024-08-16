function isValidPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber?.replace(/[\s()-]/g, "");
  const mobilePattern = /^07\d{9}$/;
  const landlinePattern = /^(01|02|03)\d{6,7}$/;
  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
}

export default isValidPhoneNumber;

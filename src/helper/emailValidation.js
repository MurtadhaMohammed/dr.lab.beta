/**
 * Validates if the email format is correct
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || email.trim() === "") return true; // Allow empty email (optional field)
  
  // Standard email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Email validation rule for Ant Design Form
 */
export const emailValidationRule = {
  validator: (_, value) => {
    if (!value || value.trim() === "") {
      return Promise.resolve(); // Optional field
    }
    if (isValidEmail(value)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Please enter a valid email address"));
  },
};

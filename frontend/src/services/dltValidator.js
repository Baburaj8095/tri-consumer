// DLT Template Validator for AquaSMS OTP messages
const DLT_TEMPLATE = "Dear Customer, your OTP for signup registration is {OTP}. Valid for {MINUTES} minutes. Please do not share it with anyone. - TOOZO (TRIKNOKET)";


/**
 * Replace placeholders with actual values.
 */
export const buildMessage = (otp, minutes) => {
  return DLT_TEMPLATE.replace('{OTP}', otp).replace('{MINUTES}', minutes);
};

/**
 * Validate that a provided message matches the exact DLT template after placeholder substitution.
 * Returns true if exactly matches, false otherwise.
 */
export const validateMessage = (message, otp, minutes) => {
  const expected = buildMessage(otp, minutes);
  // Remove any leading/trailing whitespace and compare strict equality
  return message.trim() === expected.trim();
};

export default { DLT_TEMPLATE, buildMessage, validateMessage };

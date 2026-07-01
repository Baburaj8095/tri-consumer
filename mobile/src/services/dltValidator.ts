export const DLT_TEMPLATE = 'Dear Customer, your OTP for signup registration is {OTP}. Valid for {MINUTES} minutes. Please do not share it with anyone. - TOOZO (TRIKNOKET)';

export const buildMessage = (otp: string, minutes: string | number) =>
  DLT_TEMPLATE.replace('{OTP}', otp).replace('{MINUTES}', String(minutes));

export const validateMessage = (message: string, otp: string, minutes: string | number) =>
  message.trim() === buildMessage(otp, minutes).trim();
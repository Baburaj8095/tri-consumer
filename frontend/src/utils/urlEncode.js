export const encodeMessage = (str) => {
  // Encode using encodeURIComponent then replace spaces with '+' for AquaSMS compatibility
  return encodeURIComponent(str).replace(/%20/g, '+');
};

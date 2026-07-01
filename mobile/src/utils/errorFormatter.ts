export function formatErrorMessage(err: unknown): string {
  let message = 'Operation failed';
  const maybeError = err as { response?: { data?: unknown }; message?: string };
  const data = maybeError.response?.data;

  if (data) {
    let rawMsg: unknown = '';
    if (typeof data === 'string') rawMsg = data;
    else if (typeof data === 'object' && data !== null && 'message' in data) rawMsg = (data as { message?: unknown }).message;
    else if (typeof data === 'object' && data !== null && 'detail' in data) rawMsg = (data as { detail?: unknown }).detail;
    else rawMsg = JSON.stringify(data);

    if (typeof rawMsg === 'string') {
      const trimmed = rawMsg.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return formatJsonError(JSON.parse(trimmed));
        } catch (_) {
          return rawMsg;
        }
      }
      return rawMsg;
    }
    if (typeof rawMsg === 'object' && rawMsg !== null) return formatJsonError(rawMsg);
  } else {
    message = maybeError.message || 'Operation failed';
  }
  return message;
}

function formatJsonError(obj: unknown): string {
  if (typeof obj !== 'object' || obj === null) return String(obj);
  if (Array.isArray(obj)) return obj.map(item => (typeof item === 'object' ? formatJsonError(item) : String(item))).join(', ');
  const errorsList: string[] = [];
  Object.entries(obj as Record<string, unknown>).forEach(([key, val]) => {
    if (['success', 'message', 'detail', 'status'].includes(key)) return;
    const cleanVal = Array.isArray(val) ? val.join(', ') : typeof val === 'object' && val !== null ? formatJsonError(val) : String(val);
    if (key === 'non_field_errors' || key === 'error') {
      errorsList.push(cleanVal);
      return;
    }
    let fieldName = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
    const lower = fieldName.toLowerCase().replace(/\s+/g, '');
    if (lower === 'sponsorid') fieldName = 'Sponsor ID';
    else if (lower === 'pincode') fieldName = 'Pincode';
    else if (lower === 'phone') fieldName = 'Phone';
    else if (lower === 'mobile') fieldName = 'Mobile';
    else if (lower === 'fullname') fieldName = 'Full Name';
    else if (lower === 'countrycode') fieldName = 'Country Code';
    else if (lower === 'mobilenumber') fieldName = 'Mobile Number';
    errorsList.push(`${fieldName}: ${cleanVal}`);
  });
  return errorsList.length > 0 ? errorsList.join(' | ') : JSON.stringify(obj);
}
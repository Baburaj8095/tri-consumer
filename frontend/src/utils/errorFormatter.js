export function formatErrorMessage(err) {
  let message = 'Operation failed';
  const data = err.response?.data;
  
  if (data) {
    let rawMsg = '';
    if (typeof data === 'string') {
      rawMsg = data;
    } else if (data.message) {
      rawMsg = data.message;
    } else if (data.detail) {
      rawMsg = data.detail;
    } else {
      rawMsg = JSON.stringify(data);
    }

    // Now check if rawMsg is a stringified JSON object/array
    if (typeof rawMsg === 'string') {
      const trimmed = rawMsg.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          return formatJsonError(parsed);
        } catch (e) {
          // ignore parse error and use rawMsg
        }
      }
      return rawMsg;
    } else if (typeof rawMsg === 'object' && rawMsg !== null) {
      return formatJsonError(rawMsg);
    }
  } else {
    message = err.message || 'Operation failed';
  }
  return message;
}

function formatJsonError(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => typeof item === 'object' ? formatJsonError(item) : String(item)).join(', ');
  }
  
  // It's a key-value object
  const errorsList = [];
  Object.entries(obj).forEach(([key, val]) => {
    // Skip status/boilerplate keys if any
    if (key === 'success' || key === 'message' || key === 'detail' || key === 'status') return;
    
    let cleanVal = '';
    if (Array.isArray(val)) {
      cleanVal = val.join(', ');
    } else if (typeof val === 'object' && val !== null) {
      cleanVal = formatJsonError(val);
    } else {
      cleanVal = String(val);
    }
    
    if (key === 'non_field_errors' || key === 'error') {
      errorsList.push(cleanVal);
    } else {
      // Humanize field name: e.g. "phone" -> "Phone", "sponsor_id" -> "Sponsor ID", "fullName" -> "Full Name"
      let fieldName = key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      
      const lower = fieldName.toLowerCase().replace(/\s+/g, '');
      if (lower === 'sponsorid') fieldName = 'Sponsor ID';
      else if (lower === 'pincode') fieldName = 'Pincode';
      else if (lower === 'phone') fieldName = 'Phone';
      else if (lower === 'mobile') fieldName = 'Mobile';
      else if (lower === 'fullname') fieldName = 'Full Name';
      else if (lower === 'countrycode') fieldName = 'Country Code';
      else if (lower === 'mobilenumber') fieldName = 'Mobile Number';
      
      errorsList.push(`${fieldName}: ${cleanVal}`);
    }
  });
  
  if (errorsList.length > 0) {
    return errorsList.join(' | ');
  }
  return JSON.stringify(obj);
}

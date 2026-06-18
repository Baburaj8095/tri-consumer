export function storeAuth(data) {
  const auth = data?.data || data || {};
  const token = auth.access || auth.token;
  const refresh = auth.refresh;
  if (token) {
    localStorage.setItem('triConsumerToken', token);
    localStorage.setItem('triConsumerAccess', token);
  }
  if (refresh) {
    localStorage.setItem('triConsumerRefresh', refresh);
  }
  if (auth.user) {
    localStorage.setItem('triConsumerUser', JSON.stringify(auth.user));
  }
  return token;
}

export function getAccessToken() {
  return localStorage.getItem('triConsumerAccess') || localStorage.getItem('triConsumerToken') || '';
}

export function clearAuth() {
  localStorage.removeItem('triConsumerToken');
  localStorage.removeItem('triConsumerAccess');
  localStorage.removeItem('triConsumerRefresh');
  localStorage.removeItem('triConsumerUser');
}

export async function tryTokenRefresh() {
  const refreshToken = localStorage.getItem('triConsumerRefresh');
  if (!refreshToken) {
    return false;
  }

  const CAPTAIN_API_URL = process.env.REACT_APP_CAPTAIN_API_URL || 'https://api-captain.trikonektbusiness.com/api';
  try {
    const res = await fetch(`${CAPTAIN_API_URL}/captain/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return false;
    }

    const json = await res.json();
    if (json && (json.access || json.token)) {
      storeAuth(json);
      return true;
    }
  } catch (e) {
    // Silently ignore and return false
  }
  return false;
}

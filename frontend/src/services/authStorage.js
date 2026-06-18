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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
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
    const authData = json?.data || json;
    if (json && (authData.access || authData.token)) {
      storeAuth(json);
      return true;
    }
  } catch (e) {
    // Silently ignore and return false
  }
  return false;
}

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

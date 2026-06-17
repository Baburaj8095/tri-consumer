import { getAccessToken, storeAuth, clearAuth, tryTokenRefresh } from '../../../services/authStorage';

const BASE_URL = process.env.REACT_APP_API_BASE || '';

/** Read the user's session token from localStorage (stored by the login flow). */
function getToken() {
  return getAccessToken();
}

/**
 * Fetch the Hubble SDK iframe URL from the Java backend.
 * Returns { iframeUrl, expiresIn } on success.
 * Throws an Error with a user-friendly message on failure.
 */
export async function fetchHubbleIframeUrl() {
  let token = getToken();
  if (!token) {
    throw new Error('You must be logged in to access Gift Cards.');
  }

  let res = await fetch(`${BASE_URL}/api/hubble/iframe-url`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 401) {
    const refreshed = await tryTokenRefresh();
    if (refreshed) {
      token = getToken();
      res = await fetch(`${BASE_URL}/api/hubble/iframe-url`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (res.status === 401) {
    throw new Error('Session expired. Please log in again.');
  }
  if (res.status === 503) {
    throw new Error('Gift Cards are not yet available. Please check back soon.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to load Gift Cards (HTTP ${res.status})`);
  }

  const json = await res.json();
  if (!json.success || !json.data?.iframeUrl) {
    throw new Error('Invalid response from gift card service.');
  }
  return json.data; // { iframeUrl, expiresIn }
}

/**
 * Fetch the user's Hubble gift card transaction history.
 */
export async function fetchHubbleTransactions(limit = 50) {
  let token = getToken();
  if (!token) return [];

  let res = await fetch(`${BASE_URL}/api/hubble/transactions/me?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const refreshed = await tryTokenRefresh();
    if (refreshed) {
      token = getToken();
      res = await fetch(`${BASE_URL}/api/hubble/transactions/me?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      return [];
    }
  }

  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

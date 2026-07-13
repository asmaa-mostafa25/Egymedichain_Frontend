
import config from '../config';

function getToken() {
  return localStorage.getItem(config.TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(config.REFRESH_TOKEN_KEY);
}

function setTokens(token, refreshToken) {
  if (token) localStorage.setItem(config.TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);
}

function clearSession() {
  localStorage.removeItem(config.TOKEN_KEY);
  localStorage.removeItem(config.REFRESH_TOKEN_KEY);
  localStorage.removeItem(config.USER_KEY);
}

// يمنع إرسال أكتر من طلب refresh في نفس الوقت
let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('No refresh token');

    const response = await fetch(`${config.API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearSession();
      throw new Error('Session expired');
    }

    const data = await response.json();
    setTokens(data.token, data.refreshToken);
    return data.token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function request(endpoint, options = {}, retry = true) {
  const token = getToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT);

  let response;
  try {
    response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('انتهت مهلة الاتصال بالسيرفر');
    }
    throw err;
  }
  clearTimeout(timeoutId);

  // Token منتهي: نحاول نعمل refresh مرة واحدة بس
  if (response.status === 401 && retry) {
    try {
      await refreshAccessToken();
      return request(endpoint, options, false);
    } catch {
      clearSession();
      window.location.href = '/login';
      return Promise.reject(new Error('Unauthorized'));
    }
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = (data && data.message) || `API Error: ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const httpClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body ?? {}) }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export { getToken, getRefreshToken, setTokens, clearSession };


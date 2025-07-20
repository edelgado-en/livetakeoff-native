import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://api-livetakeoff.herokuapp.com/api';

const getToken = async () => {
  return await SecureStore.getItemAsync('accessToken');
};

const request = async (endpoint, options = {}) => {
  const token = await getToken();
  const method = (options.method || 'GET').toUpperCase();

  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(method !== 'GET' && !isFormData && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `JWT ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    method,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error: ${response.status} ${errorText}`);
  }

  return response.json();
};

// Shortcut helpers
const httpService = {
  get: (url, options = {}) =>
    request(url, { ...options, method: 'GET' }),

  post: (url, data, options = {}) =>
    request(url, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  put: (url, data, options = {}) =>
    request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (url, options = {}) =>
    request(url, { ...options, method: 'DELETE' }),
};

export default httpService;
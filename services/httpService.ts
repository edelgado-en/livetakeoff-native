import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

const API_BASE_URL = 'https://api-livetakeoff.herokuapp.com/api';

const getToken = async () => {
  return await SecureStore.getItemAsync('accessToken');
};

const refreshAccessToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    await SecureStore.setItemAsync('accessToken', data.access);
    return data.access;
  } catch (err) {
    return null;
  }
};

const request = async (endpoint, options = {}) => {
  let token = await getToken();
  const method = (options.method || 'GET').toUpperCase();
  const isFormData = options.body instanceof FormData;

  const makeRequest = async (accessTokenToUse) => {
    const headers = {
      ...(method !== 'GET' && !isFormData && { 'Content-Type': 'application/json' }),
      ...(accessTokenToUse && { Authorization: `JWT ${accessTokenToUse}` }),
      ...options.headers,
    };

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method,
      headers,
    });
  };

  let response = await makeRequest(token);

  // Handle expired token
  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      response = await makeRequest(newToken);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Session expired',
        text2: 'Please log in again.',
      });

      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');

      router.replace('/login');
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error: ${response.status} ${errorText}`);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e.message}`);
  }
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

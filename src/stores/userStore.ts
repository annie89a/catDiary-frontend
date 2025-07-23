// stores/userStore.ts - Fixed with correct endpoint
import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/api';

export const useUserStore = defineStore('user', () => {
  const user = ref<any | null>(null);

  async function login(username: string, password: string) {
    const response = await apiClient.post('/user/login', { username, password });
    const payload = response.data.data;
    user.value = payload;

    const token = payload.token;
    if (token) {
      localStorage.setItem('jwtToken', token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  async function fetchMe() {
    const token = localStorage.getItem('jwtToken');

    try {
      // Fixed: Use the correct endpoint that exists in your backend
      const response = await apiClient.get('/user/profile');

      // Try both response.data and response.data.data
      const userData = response.data.data || response.data;
      user.value = userData;

      return true;
    } catch (error) {
      user.value = null;
      throw error;
    }
  }

  async function logout() {
    user.value = null;
    localStorage.removeItem('jwtToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  async function register({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) {
    const response = await apiClient.post('/user/register', {
      username,
      email,
      password,
    });
    user.value = response.data;

    return true;
  }

  // Initialize user from token if it exists
  async function initializeFromToken() {
    const token = localStorage.getItem('jwtToken');

    if (token) {
      // Check if token looks expired (if it's JWT)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const isExpired = expDate.getTime() < Date.now();

          if (isExpired) {
            await logout();
            return;
          }
        }
      } catch {
        console.error('Could not decode token for expiration check');
      }
    }

    if (token && !user.value) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        await fetchMe();
      } catch (error) {
        console.error('Failed to initialize user from token:', error);
        await logout();
      }
    } else if (user.value) {
      console.log('User already exists in store');
    } else {
      console.log('No token found, skipping initialization');
    }
  }

  return { user, login, fetchMe, logout, register, initializeFromToken };
});

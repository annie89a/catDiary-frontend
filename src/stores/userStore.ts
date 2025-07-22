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
    }
  }

  async function fetchMe() {
    const response = await apiClient.get('/users/me');
    user.value = response.data;
  }

  async function logout() {
    user.value = null;
    localStorage.removeItem('jwtToken');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  async function register({ username, password }: { username: string; password: string }) {
    const response = await apiClient.post('/user/register', {
      username,
      password,
    });
    user.value = response.data;
    return true;
  }

  return { user, login, fetchMe, logout, register };
});

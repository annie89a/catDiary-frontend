<!-- File: src/views/HomeView.vue -->
<template>
  <div class="home">
    <h1>🐱 Cat Diary Home</h1>

    <div v-if="userStore.user">
      <p>Hello, {{ userStore.user.username }}</p>
      <button @click="logout">Logout</button>

      <div class="actions">
        <router-link to="/entry/list">📃 View Entries</router-link> |
        <router-link to="/entry/create">➕ Create Entry</router-link>
      </div>
    </div>

    <div v-else>
      <router-link to="/login">Login</router-link> |
      <router-link to="/register">Register</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

async function logout() {
  await userStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.actions {
  margin-top: 1rem;
  font-size: 1.1rem;
}
</style>

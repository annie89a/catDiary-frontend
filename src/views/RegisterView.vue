<template>
  <div class="register">
    <h1>🐱 Register</h1>
    <form @submit.prevent="handleRegister">
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
    <router-link to="/login">Already have an account? Login</router-link>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const username = ref('');
const password = ref('');
const router = useRouter();
const userStore = useUserStore();

async function handleRegister() {
  const success = await userStore.register({ username: username.value, password: password.value });
  if (success) {
    router.push('/home');
  } else {
    alert('Registration failed');
  }
}
</script>

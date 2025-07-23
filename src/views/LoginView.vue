<template>
  <div class="login-page">
    <!-- Login Card -->
    <div class="login-card">
      <!-- Cute Cat Illustration -->
      <img class="cat-illustration" src="/cat-cute.svg" alt="Cute Cat" />

      <h1>🐾 Welcome Back!</h1>
      <p class="subtitle">Login to your Cat Diary</p>

      <p class="divider">🐾🐾🐾</p>

      <form @submit.prevent="handleLogin">
        <input v-model="username" placeholder="Username" />
        <input v-model="password" type="password" placeholder="Password" />
        <button type="submit">🐱 Login</button>
      </form>

      <router-link class="link" to="/register">
        Don't have an account? <span>Register here</span>
      </router-link>
    </div>
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

async function handleLogin() {
  try {
    await userStore.login(username.value, password.value);
    router.push('/home');
  } catch {
    alert('Login failed 🐾');
  }
}
</script>

<style scoped>
/* Google Font */
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  font-family: 'Quicksand', sans-serif;
  padding: 2rem 1rem;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="30" cy="30" r="2"/></g></svg>')
    repeat;
  pointer-events: none;
}

.login-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 3rem 2rem;
  border-radius: 25px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
}

.cat-illustration {
  width: 80px;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0);
  }
}

h1 {
  margin-bottom: 0.5rem;
  font-size: 2rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.subtitle {
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.divider {
  font-size: 1.2rem;
  margin: 1.5rem 0;
  color: rgba(255, 255, 255, 0.6);
}

form input {
  display: block;
  width: 100%;
  padding: 14px 18px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  box-sizing: border-box;
}

form input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

form input:focus {
  border-color: rgba(255, 255, 255, 0.5);
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

form button {
  width: 100%;
  padding: 14px;
  background: rgba(76, 175, 80, 0.2);
  color: white;
  border: 2px solid #4caf50;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

form button:hover {
  background: #4caf50;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(76, 175, 80, 0.4);
}

.link {
  display: inline-block;
  margin-top: 1.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: white;
}

.link span {
  color: #ffd700;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(255, 215, 0, 0.3);
}

.link:hover span {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>

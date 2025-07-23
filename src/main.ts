import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { useUserStore } from '@/stores/userStore';

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Initialize user from token after Pinia is set up
const userStore = useUserStore();
userStore.initializeFromToken();

app.mount('#app');

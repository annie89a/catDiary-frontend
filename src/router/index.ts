import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import CatEntryListView from '@/views/CatEntryListView.vue';
import CatEntryCreateView from '@/views/CatEntryCreateView.vue';
import CatEntryEditView from '@/views/CatEntryEditView.vue';
import { useUserStore } from '@/stores/userStore';

const routes = [
  {
    path: '/home',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
  },
  {
    path: '/entry/list',
    name: 'EntryList',
    component: CatEntryListView,
  },
  {
    path: '/entry/create',
    name: 'EntryCreate',
    component: CatEntryCreateView,
  },
  {
    path: '/entry/edit/:id',
    name: 'EntryEdit',
    component: CatEntryEditView,
    props: true,
  },
  {
    path: '/',
    redirect: '/home',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const protectedRoutes = ['/home', '/entry/list', '/entry/create'];

  if (protectedRoutes.includes(to.path) && !userStore.user) {
    return next('/login');
  }
  next();
});

export default router;

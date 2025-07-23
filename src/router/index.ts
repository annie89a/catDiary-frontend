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

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const protectedRoutes = ['/home', '/entry/list', '/entry/create', '/entry/edit'];

  // Check if the route needs protection
  const needsAuth = protectedRoutes.some((route) => to.path.startsWith(route));

  if (needsAuth) {
    const token = localStorage.getItem('jwtToken');

    // If no token exists, redirect to login
    if (!token) {
      return next('/login');
    }

    // If token exists but no user in store, wait for initialization
    if (!userStore.user) {
      try {
        // Try to initialize from token
        await userStore.initializeFromToken();

        // Check again after initialization
        if (!userStore.user) {
          return next('/login');
        }
      } catch (error) {
        return next('/login');
      }
    }
  }
  next();
});

export default router;

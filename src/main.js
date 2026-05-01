import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

import App from './App.js';
import routes from './router.js';
import { useSessionStore } from './stores/session.js';
import './style.css';

const pinia = createPinia();

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const session = useSessionStore(pinia);
  await session.bootstrap();

  if (to.meta.guestOnly && session.isLoggedIn) {
    return { name: 'cars' };
  }

  if (to.meta.requiresAuth && !session.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.roles && !to.meta.roles.includes(session.user?.role)) {
    return { name: 'cars' };
  }

  return true;
});

createApp(App)
  .use(pinia)
  .use(router)
  .mount('#app');

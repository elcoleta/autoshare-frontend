import { ref, watch } from 'vue';
import { RouterView, useRoute } from 'vue-router';
import { useSessionStore } from './stores/session.js';
import { apiFetch } from './services/api.js';

export default {
  components: { RouterView },
  setup() {
    const route = useRoute();
    const session = useSessionStore();
    const menuOpen = ref(false);
    const messageCount = ref(0);

    function logout() {
      session.logout();
      menuOpen.value = false;
      messageCount.value = 0;
    }

    async function loadMessageCount() {
      if (!session.isLoggedIn || !session.user) {
        messageCount.value = 0;
        return;
      }

      try {
        const response = await apiFetch('/conversations?per_page=20', {
          token: session.token,
        });

        messageCount.value = response.data.filter((conversation) =>
          Number(conversation.latest_sender_id) !== Number(session.user.id)
        ).length;
      } catch (error) {
        messageCount.value = 0;
      }
    }

    watch(
      () => [session.isLoggedIn, session.user?.id, route.fullPath],
      () => {
        loadMessageCount();
      },
      { immediate: true }
    );

    return {
      session,
      menuOpen,
      messageCount,
      logout,
    };
  },
  template: `
    <div class="page-shell">
      <header class="site-header">
        <nav class="navbar navbar-expand-lg">
          <div class="container py-3">
            <router-link class="navbar-brand d-flex align-items-center gap-3 fw-bold" :to="{ name: 'cars' }">
              <span class="brand-mark">A</span>
              <span>
                <span class="d-block">AutoShare</span>
                <small class="text-muted-soft fw-semibold">Car rental marketplace</small>
              </span>
            </router-link>

            <button class="navbar-toggler" type="button" @click="menuOpen = !menuOpen">
              <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" :class="{ show: menuOpen }">
              <div class="navbar-nav ms-auto align-items-lg-center gap-2">
                <router-link class="nav-link fw-semibold" :to="{ name: 'cars' }" @click="menuOpen = false">Cars</router-link>
                <router-link v-if="session.isLoggedIn" class="nav-link fw-semibold" :to="{ name: 'bookings' }" @click="menuOpen = false">Bookings</router-link>
                <router-link v-if="session.isLoggedIn" class="nav-link fw-semibold nav-link-badge" :to="{ name: 'messages' }" @click="menuOpen = false">
                  <span>Messages</span>
                  <span v-if="messageCount" class="nav-count">{{ messageCount }}</span>
                </router-link>
                <router-link v-if="session.isLoggedIn" class="nav-link fw-semibold" :to="{ name: 'profile' }" @click="menuOpen = false">Profile</router-link>
                <router-link v-if="session.isAdmin" class="nav-link fw-semibold" :to="{ name: 'admin-users' }" @click="menuOpen = false">Admin</router-link>
                <router-link v-if="!session.isLoggedIn" class="btn btn-ghost-brand" :to="{ name: 'login' }" @click="menuOpen = false">Log in</router-link>
                <router-link v-if="!session.isLoggedIn" class="btn btn-brand" :to="{ name: 'register' }" @click="menuOpen = false">Register</router-link>
                <div v-if="session.isLoggedIn" class="d-flex align-items-center gap-2">
                  <span class="fw-semibold">{{ session.user.name }}</span>
                  <span class="role-pill" :class="session.user.role">{{ session.user.role }}</span>
                  <button class="btn btn-ghost-brand" @click="logout(); $router.push({ name: 'cars' })">Log out</button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  `,
};

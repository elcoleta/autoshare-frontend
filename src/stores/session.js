import { defineStore } from 'pinia';
import { apiFetch } from '../services/api.js';

export const useSessionStore = defineStore('session', {
  state: () => ({
    token: localStorage.getItem('autoshare_token') || '',
    user: null,
    ready: false,
  }),
  getters: {
    isLoggedIn(state) {
      return Boolean(state.token && state.user);
    },
    isOwner(state) {
      return ['owner', 'admin'].includes(state.user?.role || '');
    },
    isAdmin(state) {
      return state.user?.role === 'admin';
    },
  },
  actions: {
    async bootstrap() {
      if (this.ready) {
        return;
      }

      if (!this.token) {
        this.ready = true;
        return;
      }

      try {
        const response = await apiFetch('/auth/me', {
          token: this.token,
        });
        this.user = response.data.user;
      } catch (error) {
        this.logout();
      } finally {
        this.ready = true;
      }
    },
    setSession(token, user) {
      this.token = token;
      this.user = user;
      this.ready = true;
      localStorage.setItem('autoshare_token', token);
    },
    logout() {
      this.token = '';
      this.user = null;
      this.ready = true;
      localStorage.removeItem('autoshare_token');
    },
  },
});

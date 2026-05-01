import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { apiFetch } from '../services/api.js';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const session = useSessionStore();
    const form = reactive({ email: '', password: '' });
    const error = ref('');
    const loading = ref(false);

    async function submit() {
      loading.value = true;
      error.value = '';

      try {
        const response = await apiFetch('/auth/login', {
          method: 'POST',
          body: form,
        });

        session.setSession(response.data.token, response.data.user);
        router.push(route.query.redirect || { name: 'cars' });
      } catch (loginError) {
        error.value = loginError.message;
      } finally {
        loading.value = false;
      }
    }

    return {
      form,
      error,
      loading,
      submit,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-5">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">Welcome back</p>
            <h1 class="h2 fw-bold mb-4">Log in</h1>
            <div class="mb-3">
              <label class="form-label fw-semibold">Email</label>
              <input v-model="form.email" type="email" class="surface-input w-100">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Password</label>
              <input v-model="form.password" type="password" class="surface-input w-100">
            </div>
            <div class="mb-3 text-end">
              <router-link class="small" :to="{ name: 'forgot-password' }">Forgot your password?</router-link>
            </div>
            <p v-if="error" class="text-danger small fw-semibold">{{ error }}</p>
            <button class="btn btn-brand w-100" :disabled="loading" @click="submit">{{ loading ? 'Logging in...' : 'Log in' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
};

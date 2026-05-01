import { reactive, ref } from 'vue';
import { apiFetch } from '../services/api.js';

export default {
  setup() {
    const form = reactive({ email: '' });
    const loading = ref(false);
    const error = ref('');
    const result = ref(null);

    async function submit() {
      loading.value = true;
      error.value = '';
      result.value = null;

      try {
        const response = await apiFetch('/auth/forgot-password', {
          method: 'POST',
          body: form,
        });
        result.value = response.data;
      } catch (requestError) {
        error.value = requestError.message;
      } finally {
        loading.value = false;
      }
    }

    return {
      form,
      loading,
      error,
      result,
      submit,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">Account help</p>
            <h1 class="h2 fw-bold mb-4">Forgot password</h1>
            <div class="mb-3">
              <label class="form-label fw-semibold">Email</label>
              <input v-model="form.email" type="email" class="surface-input w-100">
            </div>
            <p v-if="error" class="text-danger small fw-semibold">{{ error }}</p>
            <div v-if="result" class="small mb-3">
              <p class="fw-semibold mb-2">{{ result.message }}</p>
              <div v-if="result.reset_token" class="empty-state text-start">
                <p class="mb-2"><strong>Reset token:</strong> {{ result.reset_token }}</p>
                <p class="mb-2"><strong>Expires at:</strong> {{ result.expires_at }}</p>
                <router-link class="btn btn-brand btn-sm" :to="{ name: 'reset-password', query: { token: result.reset_token } }">Continue to reset form</router-link>
              </div>
            </div>
            <button class="btn btn-brand w-100" :disabled="loading" @click="submit">{{ loading ? 'Submitting...' : 'Request reset' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
};

import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiFetch } from '../services/api.js';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const form = reactive({
      token: String(route.query.token || ''),
      new_password: '',
    });
    const loading = ref(false);
    const error = ref('');
    const success = ref('');

    async function submit() {
      loading.value = true;
      error.value = '';
      success.value = '';

      try {
        await apiFetch('/auth/reset-password', {
          method: 'POST',
          body: form,
        });
        success.value = 'Password updated. You can now log in.';
        setTimeout(() => {
          router.push({ name: 'login' });
        }, 1000);
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
      success,
      submit,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">Account help</p>
            <h1 class="h2 fw-bold mb-4">Reset password</h1>
            <div class="mb-3">
              <label class="form-label fw-semibold">Reset token</label>
              <input v-model="form.token" class="surface-input w-100">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">New password</label>
              <input v-model="form.new_password" type="password" class="surface-input w-100">
            </div>
            <p v-if="error" class="text-danger small fw-semibold">{{ error }}</p>
            <p v-if="success" class="text-success small fw-semibold">{{ success }}</p>
            <button class="btn btn-brand w-100" :disabled="loading" @click="submit">{{ loading ? 'Updating...' : 'Update password' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
};

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { apiFetch } from '../services/api.js';

export default {
  setup() {
    const router = useRouter();
    const session = useSessionStore();
    const form = reactive({
      name: '',
      email: '',
      password: '',
      role: 'customer',
    });
    const error = ref('');
    const loading = ref(false);

    async function submit() {
      loading.value = true;
      error.value = '';

      try {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: form,
        });

        session.setSession(response.data.token, response.data.user);
        router.push({ name: 'cars' });
      } catch (registerError) {
        error.value = registerError.message;
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
        <div class="col-md-9 col-lg-6">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">Create an account</p>
            <h1 class="h2 fw-bold mb-4">Join AutoShare</h1>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Name</label>
                <input v-model="form.name" class="surface-input w-100">
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Email</label>
                <input v-model="form.email" type="email" class="surface-input w-100">
              </div>
              <div class="col-md-7">
                <label class="form-label fw-semibold">Password</label>
                <input v-model="form.password" type="password" class="surface-input w-100">
              </div>
              <div class="col-md-5">
                <label class="form-label fw-semibold">Role</label>
                <select v-model="form.role" class="surface-select w-100">
                  <option value="customer">Customer</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
            </div>
            <p v-if="error" class="text-danger small fw-semibold mt-3">{{ error }}</p>
            <button class="btn btn-brand w-100 mt-2" :disabled="loading" @click="submit">{{ loading ? 'Creating account...' : 'Register' }}</button>
          </div>
        </div>
      </div>
    </div>
  `,
};

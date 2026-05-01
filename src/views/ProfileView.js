import { onMounted, reactive, ref } from 'vue';
import { useSessionStore } from '../stores/session.js';
import { apiFetch } from '../services/api.js';

export default {
  setup() {
    const session = useSessionStore();
    const profileForm = reactive({ name: '', email: '' });
    const passwordForm = reactive({ current_password: '', new_password: '' });
    const profileMessage = ref('');
    const passwordMessage = ref('');
    const loadError = ref('');

    async function loadProfile() {
      loadError.value = '';

      try {
        const response = await apiFetch('/profile', {
          token: session.token,
        });
        Object.assign(profileForm, response.data);
      } catch (error) {
        loadError.value = error.message;
      }
    }

    async function saveProfile() {
      try {
        const response = await apiFetch('/profile', {
          method: 'PUT',
          token: session.token,
          body: profileForm,
        });
        session.user = response.data;
        profileMessage.value = 'Profile updated.';
      } catch (profileError) {
        profileMessage.value = profileError.message;
      }
    }

    async function savePassword() {
      try {
        await apiFetch('/profile/password', {
          method: 'PUT',
          token: session.token,
          body: passwordForm,
        });
        passwordForm.current_password = '';
        passwordForm.new_password = '';
        passwordMessage.value = 'Password updated.';
      } catch (passwordError) {
        passwordMessage.value = passwordError.message;
      }
    }

    onMounted(loadProfile);

    return {
      profileForm,
      passwordForm,
      profileMessage,
      passwordMessage,
      loadError,
      saveProfile,
      savePassword,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="row g-4">
        <div class="col-lg-7">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">Profile</p>
            <h1 class="h2 fw-bold mb-4">Personal information</h1>
            <div class="mb-3">
              <label class="form-label fw-semibold">Name</label>
              <input v-model="profileForm.name" class="surface-input w-100">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">Email</label>
              <input v-model="profileForm.email" type="email" class="surface-input w-100">
            </div>
            <p v-if="loadError" class="small fw-semibold text-danger">{{ loadError }}</p>
            <p v-if="profileMessage" class="small fw-semibold" :class="profileMessage === 'Profile updated.' ? 'text-success' : 'text-danger'">{{ profileMessage }}</p>
            <button class="btn btn-brand" @click="saveProfile">Save profile</button>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">Security</p>
            <h2 class="h3 fw-bold mb-4">Change password</h2>
            <div class="mb-3">
              <label class="form-label fw-semibold">Current password</label>
              <input v-model="passwordForm.current_password" type="password" class="surface-input w-100">
            </div>
            <div class="mb-3">
              <label class="form-label fw-semibold">New password</label>
              <input v-model="passwordForm.new_password" type="password" class="surface-input w-100">
            </div>
            <p v-if="passwordMessage" class="small fw-semibold" :class="passwordMessage === 'Password updated.' ? 'text-success' : 'text-danger'">{{ passwordMessage }}</p>
            <button class="btn btn-warm" @click="savePassword">Update password</button>
          </div>
        </div>
      </div>
    </div>
  `,
};

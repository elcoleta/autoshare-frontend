import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { apiFetch } from '../services/api.js';

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const session = useSessionStore();
    const isEditing = computed(() => Boolean(route.params.id));
    const form = reactive({
      brand: '',
      model: '',
      location: '',
      description: '',
      price_per_day: '',
      image_url: '',
    });
    const error = ref('');
    const saving = ref(false);

    async function loadCar() {
      if (!isEditing.value) {
        return;
      }

      try {
        const response = await apiFetch(`/cars/${route.params.id}`);
        Object.assign(form, response.data);
      } catch (loadError) {
        error.value = loadError.message;
      }
    }

    async function saveCar() {
      error.value = '';
      saving.value = true;

      try {
        const response = await apiFetch(isEditing.value ? `/cars/${route.params.id}` : '/cars', {
          method: isEditing.value ? 'PUT' : 'POST',
          token: session.token,
          body: form,
        });

        router.push({ name: 'car-detail', params: { id: response.data.id } });
      } catch (saveError) {
        error.value = saveError.message;
      } finally {
        saving.value = false;
      }
    }

    async function deleteCar() {
      if (!isEditing.value || !confirm('Delete this listing?')) {
        return;
      }

      error.value = '';

      try {
        await apiFetch(`/cars/${route.params.id}`, {
          method: 'DELETE',
          token: session.token,
        });
        router.push({ name: 'cars' });
      } catch (deleteError) {
        error.value = deleteError.message;
      }
    }

    onMounted(loadCar);

    return {
      form,
      error,
      saving,
      isEditing,
      saveCar,
      deleteCar,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="row justify-content-center">
        <div class="col-xl-8">
          <div class="panel-card p-4 p-lg-5">
            <p class="eyebrow mb-2">{{ isEditing ? 'Edit car' : 'Create car' }}</p>
            <h1 class="h2 fw-bold mb-4">{{ isEditing ? 'Update your listing' : 'Publish a new car' }}</h1>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-semibold">Brand</label>
                <input v-model="form.brand" class="surface-input w-100">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Model</label>
                <input v-model="form.model" class="surface-input w-100">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Location</label>
                <input v-model="form.location" class="surface-input w-100" placeholder="Amsterdam">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Price per day</label>
                <input v-model="form.price_per_day" type="number" min="1" class="surface-input w-100">
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Image URL</label>
                <input v-model="form.image_url" class="surface-input w-100" placeholder="https://example.com/car.jpg">
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Description</label>
                <textarea v-model="form.description" class="surface-textarea w-100" placeholder="Add a short description of the car."></textarea>
              </div>
            </div>
            <p v-if="error" class="text-danger small fw-semibold mt-3 mb-0">{{ error }}</p>
            <div class="d-flex flex-wrap gap-2 mt-4">
              <button class="btn btn-brand" :disabled="saving" @click="saveCar">{{ saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create listing' }}</button>
              <button v-if="isEditing" class="btn btn-outline-danger rounded-pill" @click="deleteCar">Delete listing</button>
              <router-link class="btn btn-ghost-brand" :to="{ name: 'cars' }">Cancel</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { apiFetch, money } from '../services/api.js';
import EmptyState from '../components/EmptyState.js';

export default {
  components: { EmptyState },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const session = useSessionStore();
    const car = ref(null);
    const error = ref('');
    const bookingForm = reactive({
      start_date: '',
      end_date: '',
    });
    const messageForm = ref('');
    const bookingError = ref('');
    const messageError = ref('');

    const canManage = computed(() => {
      if (!session.user || !car.value) {
        return false;
      }

      return session.user.role === 'admin' || Number(session.user.id) === Number(car.value.owner_id);
    });

    const totalPrice = computed(() => {
      if (!car.value || !bookingForm.start_date || !bookingForm.end_date) {
        return '';
      }

      const start = new Date(bookingForm.start_date);
      const end = new Date(bookingForm.end_date);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
        return '';
      }

      const days = Math.floor((end - start) / 86400000) + 1;
      return `${money(Number(car.value.price_per_day) * days)} for ${days} day${days > 1 ? 's' : ''}`;
    });

    async function loadCar() {
      error.value = '';

      try {
        const response = await apiFetch(`/cars/${route.params.id}`);
        car.value = response.data;
      } catch (loadError) {
        error.value = loadError.message;
      }
    }

    async function createBooking() {
      bookingError.value = '';

      try {
        await apiFetch('/bookings', {
          method: 'POST',
          token: session.token,
          body: {
            car_id: Number(route.params.id),
            start_date: bookingForm.start_date,
            end_date: bookingForm.end_date,
          },
        });

        router.push({ name: 'bookings' });
      } catch (error) {
        bookingError.value = error.message;
      }
    }

    async function startConversation() {
      if (!car.value) {
        return;
      }

      messageError.value = '';

      if (messageForm.value.trim() === '') {
        messageError.value = 'Write a message before starting a conversation.';
        return;
      }

      try {
        const response = await apiFetch('/conversations', {
          method: 'POST',
          token: session.token,
          body: {
            recipient_id: Number(car.value.owner_id),
            message: messageForm.value,
          },
        });

        router.push({
          name: 'messages',
          query: { id: response.data.conversation_id },
        });
      } catch (error) {
        messageError.value = error.message;
      }
    }

    onMounted(loadCar);
    watch(() => route.params.id, loadCar);

    return {
      session,
      car,
      error,
      bookingForm,
      messageForm,
      bookingError,
      messageError,
      canManage,
      totalPrice,
      createBooking,
      startConversation,
      money,
    };
  },
  template: `
    <div class="container py-4 py-lg-5" v-if="car">
      <div class="row g-4">
        <div class="col-lg-7">
          <img class="car-image mb-4" :src="car.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'" :alt="car.brand + ' ' + car.model">
          <div class="panel-card p-4">
            <p class="eyebrow mb-2">{{ car.location }}</p>
            <div class="d-flex flex-wrap justify-content-between gap-3 align-items-start mb-3">
              <div>
                <h1 class="h2 fw-bold mb-1">{{ car.brand }} {{ car.model }}</h1>
                <p class="text-muted-soft mb-0">Hosted by {{ car.owner_name || 'Private owner' }}</p>
              </div>
              <div class="text-end">
                <div class="car-price">{{ money(car.price_per_day) }}</div>
                <small class="text-muted-soft">per day</small>
              </div>
            </div>
            <p class="mb-0 text-muted-soft">{{ car.description || 'See the details below and choose your booking dates.' }}</p>
          </div>
        </div>
        <div class="col-lg-5">
          <div class="panel-card p-4 mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h2 class="h4 fw-bold mb-0">Booking</h2>
              <router-link v-if="canManage" class="btn btn-ghost-brand btn-sm" :to="{ name: 'car-edit', params: { id: car.id } }">Edit listing</router-link>
            </div>

            <div v-if="session.isLoggedIn && !canManage">
              <div class="mb-3">
                <label class="form-label fw-semibold">Start date</label>
                <input v-model="bookingForm.start_date" type="date" class="surface-input w-100">
              </div>
              <div class="mb-3">
                <label class="form-label fw-semibold">End date</label>
                <input v-model="bookingForm.end_date" type="date" class="surface-input w-100">
              </div>
              <p class="text-muted-soft small" v-if="totalPrice">{{ totalPrice }}</p>
              <p v-if="bookingError" class="text-danger small fw-semibold mb-3">{{ bookingError }}</p>
              <button class="btn btn-brand w-100" @click="createBooking">Book this car</button>
            </div>

            <div v-else-if="!session.isLoggedIn" class="empty-state">
              <h3 class="h5 fw-bold mb-2">Log in to continue</h3>
              <p class="mb-3">You need an account before you can book or message an owner.</p>
              <router-link class="btn btn-brand" :to="{ name: 'login' }">Log in</router-link>
            </div>

            <div v-else class="empty-state">
              <h3 class="h5 fw-bold mb-2">Owner view</h3>
              <p class="mb-0">You are viewing your own listing, so booking is disabled.</p>
            </div>
          </div>

          <div class="panel-card p-4" v-if="session.isLoggedIn && !canManage">
            <h2 class="h4 fw-bold mb-3">Message the owner</h2>
            <textarea v-model="messageForm" class="surface-textarea w-100 mb-3" placeholder="Ask about pickup, availability or details."></textarea>
            <p v-if="messageError" class="text-danger small fw-semibold mb-3">{{ messageError }}</p>
            <button class="btn btn-warm w-100" @click="startConversation">Start conversation</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="error" class="container py-5">
      <EmptyState title="Car not found" :text="error" />
    </div>
    <div v-else class="container py-5 text-muted-soft">Loading car details...</div>
  `,
};

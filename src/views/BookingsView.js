import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { apiFetch, buildQuery, money, shortDate } from '../services/api.js';
import EmptyState from '../components/EmptyState.js';
import PaginationNav from '../components/PaginationNav.js';

export default {
  components: { EmptyState, PaginationNav },
  setup() {
    const router = useRouter();
    const session = useSessionStore();
    const bookings = ref([]);
    const meta = ref({ page: 1, total_pages: 1 });
    const filterStatus = ref('');
    const error = ref('');
    const loading = ref(false);

    async function loadBookings(page = 1) {
      loading.value = true;
      error.value = '';

      try {
        const response = await apiFetch(`/bookings${buildQuery({
          page,
          per_page: 6,
          status: filterStatus.value,
        })}`, {
          token: session.token,
        });

        bookings.value = response.data;
        meta.value = response.meta;
      } catch (loadError) {
        error.value = loadError.message;
      } finally {
        loading.value = false;
      }
    }

    async function cancelBooking(id) {
      try {
        await apiFetch(`/bookings/${id}`, {
          method: 'PUT',
          token: session.token,
        });
        loadBookings(meta.value.page);
      } catch (cancelError) {
        error.value = cancelError.message;
      }
    }

    async function openConversation(booking) {
      error.value = '';

      try {
        const response = await apiFetch('/conversations', {
          method: 'POST',
          token: session.token,
          body: {
            recipient_id: Number(booking.owner_id),
            message: '',
          },
        });

        router.push({
          name: 'messages',
          query: { id: response.data.conversation_id },
        });
      } catch (conversationError) {
        error.value = conversationError.message;
      }
    }

    onMounted(() => loadBookings());

    return {
      session,
      bookings,
      meta,
      filterStatus,
      error,
      loading,
      loadBookings,
      cancelBooking,
      openConversation,
      money,
      shortDate,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <p class="eyebrow mb-2">Bookings</p>
          <h1 class="h2 fw-bold mb-1">Your reservations</h1>
          <p class="text-muted-soft mb-0">Track upcoming trips and cancel when plans change.</p>
        </div>
        <select v-model="filterStatus" class="surface-select" @change="loadBookings(1)">
          <option value="">All statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <p v-if="error" class="text-danger fw-semibold">{{ error }}</p>
      <div v-if="loading" class="text-muted-soft">Loading bookings...</div>
      <div v-else-if="bookings.length === 0">
        <EmptyState title="No bookings yet" text="Once you book a car, it will appear here." />
      </div>
      <div v-else class="row g-4">
        <div v-for="booking in bookings" :key="booking.id" class="col-lg-6">
          <div class="panel-card p-4">
            <div class="d-flex justify-content-between flex-wrap gap-3">
              <div>
                <p class="eyebrow mb-2">{{ booking.location }}</p>
                <h2 class="h4 fw-bold mb-1">{{ booking.brand }} {{ booking.model }}</h2>
                <p class="text-muted-soft mb-2">{{ shortDate(booking.start_date) }} to {{ shortDate(booking.end_date) }}</p>
                <p v-if="booking.owner_name" class="text-muted-soft mb-2">Owner: {{ booking.owner_name }}</p>
              </div>
              <span class="status-pill" :class="booking.status">{{ booking.status }}</span>
            </div>
            <p class="fw-semibold mb-3">{{ money(booking.total_price) }}</p>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-if="booking.owner_id && Number(booking.owner_id) !== Number(session.user?.id)"
                class="btn btn-ghost-brand rounded-pill"
                @click="openConversation(booking)"
              >
                Message owner
              </button>
              <button v-if="booking.status === 'confirmed'" class="btn btn-outline-danger rounded-pill" @click="cancelBooking(booking.id)">Cancel booking</button>
            </div>
          </div>
        </div>
      </div>

      <PaginationNav :meta="meta" @change="loadBookings" />
    </div>
  `,
};

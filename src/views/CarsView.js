import { onMounted, reactive, ref } from 'vue';
import { useSessionStore } from '../stores/session.js';
import { apiFetch, buildQuery } from '../services/api.js';
import CarCard from '../components/CarCard.js';
import EmptyState from '../components/EmptyState.js';
import PaginationNav from '../components/PaginationNav.js';

export default {
  components: { CarCard, EmptyState, PaginationNav },
  setup() {
    const session = useSessionStore();
    const filters = reactive({
      search: '',
      location: '',
      min_price: '',
      max_price: '',
      available_from: '',
      available_to: '',
      page: 1,
      per_page: 6,
    });
    const cars = ref([]);
    const meta = ref({ page: 1, total_pages: 1, total: 0 });
    const loading = ref(false);
    const error = ref('');

    async function loadCars() {
      loading.value = true;
      error.value = '';

      try {
        const response = await apiFetch(`/cars${buildQuery(filters)}`);
        cars.value = response.data;
        meta.value = response.meta;
      } catch (loadError) {
        error.value = loadError.message;
      } finally {
        loading.value = false;
      }
    }

    function resetFilters() {
      Object.assign(filters, {
        search: '',
        location: '',
        min_price: '',
        max_price: '',
        available_from: '',
        available_to: '',
        page: 1,
        per_page: 6,
      });
      loadCars();
    }

    onMounted(loadCars);

    return {
      session,
      filters,
      cars,
      meta,
      loading,
      error,
      loadCars,
      resetFilters,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <p class="eyebrow mb-2">Cars</p>
          <h1 class="h2 fw-bold mb-1">Find a car for your next trip</h1>
          <p class="text-muted-soft mb-0">Filter by city, price and availability.</p>
        </div>
        <router-link v-if="session.isOwner" class="btn btn-brand" :to="{ name: 'car-create' }">Add a car</router-link>
      </div>

      <section class="panel-card p-4 mb-4">
        <div class="row g-3">
          <div class="col-lg-3">
            <label class="form-label fw-semibold">Search</label>
            <input v-model="filters.search" class="surface-input w-100" placeholder="Brand, model or city">
          </div>
          <div class="col-lg-2">
            <label class="form-label fw-semibold">Location</label>
            <input v-model="filters.location" class="surface-input w-100" placeholder="Amsterdam">
          </div>
          <div class="col-lg-2">
            <label class="form-label fw-semibold">Min price</label>
            <input v-model="filters.min_price" type="number" min="0" class="surface-input w-100">
          </div>
          <div class="col-lg-2">
            <label class="form-label fw-semibold">Max price</label>
            <input v-model="filters.max_price" type="number" min="0" class="surface-input w-100">
          </div>
          <div class="col-lg-3">
            <label class="form-label fw-semibold">Available from</label>
            <input v-model="filters.available_from" type="date" class="surface-input w-100">
          </div>
          <div class="col-lg-3">
            <label class="form-label fw-semibold">Available to</label>
            <input v-model="filters.available_to" type="date" class="surface-input w-100">
          </div>
          <div class="col-lg-9 d-flex align-items-end gap-2">
            <button class="btn btn-brand" @click="filters.page = 1; loadCars()">Apply filters</button>
            <button class="btn btn-ghost-brand" @click="resetFilters">Reset</button>
          </div>
        </div>
      </section>

      <p v-if="error" class="text-danger fw-semibold">{{ error }}</p>
      <div v-if="loading" class="text-muted-soft">Loading cars...</div>
      <div v-else-if="cars.length === 0">
        <EmptyState title="No cars found" text="Try a broader search or clear the filters." />
      </div>
      <div v-else class="row g-4">
        <div v-for="car in cars" :key="car.id" class="col-md-6 col-xl-4">
          <CarCard :car="car" />
        </div>
      </div>

      <PaginationNav :meta="meta" @change="(page) => { filters.page = page; loadCars(); }" />
    </div>
  `,
};

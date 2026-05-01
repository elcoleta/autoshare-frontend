import { computed } from 'vue';
import { useSessionStore } from '../stores/session.js';
import { money } from '../services/api.js';

export default {
  props: {
    car: { type: Object, required: true },
  },
  setup(props) {
    const session = useSessionStore();
    const canManage = computed(() => {
      if (!session.user) {
        return false;
      }

      return session.user.role === 'admin' || Number(session.user.id) === Number(props.car.owner_id);
    });

    return {
      canManage,
      money,
    };
  },
  template: `
    <article class="panel-card p-3 car-card">
      <img
        class="car-image mb-3"
        :src="car.image_url || 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'"
        :alt="car.brand + ' ' + car.model"
      >
      <div class="d-flex justify-content-between gap-3 align-items-start">
        <div>
          <p class="eyebrow mb-2">{{ car.location }}</p>
          <h3 class="h5 fw-bold mb-1">{{ car.brand }} {{ car.model }}</h3>
          <p class="text-muted-soft mb-2">{{ car.owner_name || 'Private owner' }}</p>
        </div>
        <div class="text-end">
          <div class="car-price">{{ money(car.price_per_day) }}</div>
          <small class="text-muted-soft">per day</small>
        </div>
      </div>
      <p class="text-muted-soft small mb-3">{{ car.description || 'View the car details, check the price and contact the owner.' }}</p>
      <div class="d-flex flex-wrap gap-2">
        <router-link class="btn btn-brand btn-sm" :to="{ name: 'car-detail', params: { id: car.id } }">View details</router-link>
        <router-link v-if="canManage" class="btn btn-ghost-brand btn-sm" :to="{ name: 'car-edit', params: { id: car.id } }">Edit</router-link>
      </div>
    </article>
  `,
};

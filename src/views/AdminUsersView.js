import { onMounted, reactive, ref } from 'vue';
import { useSessionStore } from '../stores/session.js';
import { apiFetch, buildQuery, shortDate } from '../services/api.js';
import EmptyState from '../components/EmptyState.js';
import PaginationNav from '../components/PaginationNav.js';

export default {
  components: { EmptyState, PaginationNav },
  setup() {
    const session = useSessionStore();
    const users = ref([]);
    const meta = ref({ page: 1, total_pages: 1 });
    const filters = reactive({ search: '', role: '' });
    const error = ref('');
    const loading = ref(false);

    async function loadUsers(page = 1) {
      loading.value = true;
      error.value = '';

      try {
        const response = await apiFetch(`/users${buildQuery({
          page,
          per_page: 8,
          search: filters.search,
          role: filters.role,
        })}`, {
          token: session.token,
        });
        users.value = response.data;
        meta.value = response.meta;
      } catch (loadError) {
        error.value = loadError.message;
      } finally {
        loading.value = false;
      }
    }

    async function updateRole(user) {
      error.value = '';

      try {
        const response = await apiFetch(`/users/${user.id}`, {
          method: 'PUT',
          token: session.token,
          body: { role: user.role },
        });

        const index = users.value.findIndex((item) => item.id === response.data.id);
        if (index >= 0) {
          users.value[index] = response.data;
        }
      } catch (updateError) {
        error.value = updateError.message;
      }
    }

    onMounted(loadUsers);

    return {
      users,
      meta,
      filters,
      error,
      loading,
      loadUsers,
      updateRole,
      shortDate,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <p class="eyebrow mb-2">Admin</p>
          <h1 class="h2 fw-bold mb-1">Manage users</h1>
          <p class="text-muted-soft mb-0">Role changes are saved directly through the API.</p>
        </div>
      </div>

      <section class="panel-card p-4 mb-4">
        <div class="row g-3">
          <div class="col-md-8">
            <label class="form-label fw-semibold">Search</label>
            <input v-model="filters.search" class="surface-input w-100" placeholder="Name or email">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Role</label>
            <select v-model="filters.role" class="surface-select w-100">
              <option value="">All roles</option>
              <option value="customer">Customer</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div class="mt-3">
          <button class="btn btn-brand" @click="loadUsers(1)">Apply</button>
        </div>
      </section>

      <p v-if="error" class="text-danger fw-semibold">{{ error }}</p>
      <div v-if="loading" class="text-muted-soft">Loading users...</div>
      <div v-else-if="users.length === 0">
        <EmptyState title="No users found" text="Try clearing the search filters." />
      </div>
      <div v-else class="table-responsive">
        <table class="table table-soft align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td class="fw-semibold">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ shortDate(user.created_at) }}</td>
              <td>
                <select v-model="user.role" class="surface-select" @change="updateRole(user)">
                  <option value="customer">Customer</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <PaginationNav :meta="meta" @change="loadUsers" />
    </div>
  `,
};

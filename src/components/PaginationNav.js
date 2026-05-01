export default {
  props: {
    meta: { type: Object, required: true },
  },
  emits: ['change'],
  template: `
    <div class="d-flex justify-content-between align-items-center mt-4" v-if="meta.total_pages > 1">
      <small class="text-muted-soft">Page {{ meta.page }} of {{ meta.total_pages }}</small>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-ghost-brand" :disabled="meta.page <= 1" @click="$emit('change', meta.page - 1)">Previous</button>
        <button class="btn btn-sm btn-brand" :disabled="meta.page >= meta.total_pages" @click="$emit('change', meta.page + 1)">Next</button>
      </div>
    </div>
  `,
};

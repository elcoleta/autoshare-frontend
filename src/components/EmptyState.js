export default {
  props: {
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  template: `
    <div class="empty-state">
      <h3 class="h5 fw-bold mb-2">{{ title }}</h3>
      <p class="mb-0">{{ text }}</p>
    </div>
  `,
};

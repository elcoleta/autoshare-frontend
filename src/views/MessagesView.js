import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSessionStore } from '../stores/session.js';
import { apiFetch, shortDate } from '../services/api.js';
import EmptyState from '../components/EmptyState.js';

export default {
  components: { EmptyState },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const session = useSessionStore();
    const conversations = ref([]);
    const messages = ref([]);
    const newMessage = ref('');
    const error = ref('');

    const activeConversationId = computed(() => Number(route.query.id || 0));

    async function loadConversations() {
      error.value = '';

      try {
        const response = await apiFetch('/conversations?per_page=12', {
          token: session.token,
        });

        conversations.value = response.data;

        if (!activeConversationId.value && conversations.value.length > 0) {
          router.replace({
            name: 'messages',
            query: { id: conversations.value[0].id },
          });
        }
      } catch (loadError) {
        error.value = loadError.message;
      }
    }

    async function loadMessages() {
      if (!activeConversationId.value) {
        messages.value = [];
        return;
      }

      error.value = '';

      try {
        const response = await apiFetch(`/conversations/${activeConversationId.value}/messages?per_page=40`, {
          token: session.token,
        });

        messages.value = response.data.messages;
      } catch (loadError) {
        error.value = loadError.message;
      }
    }

    async function sendMessage() {
      if (!activeConversationId.value || newMessage.value.trim() === '') {
        return;
      }

      error.value = '';

      try {
        await apiFetch(`/conversations/${activeConversationId.value}/messages`, {
          method: 'POST',
          token: session.token,
          body: { body: newMessage.value },
        });

        newMessage.value = '';
        loadMessages();
        loadConversations();
      } catch (sendError) {
        error.value = sendError.message;
      }
    }

    onMounted(async () => {
      await loadConversations();
      await loadMessages();
    });

    watch(() => route.query.id, loadMessages);

    return {
      session,
      conversations,
      messages,
      newMessage,
      error,
      activeConversationId,
      sendMessage,
      shortDate,
    };
  },
  template: `
    <div class="container py-4 py-lg-5">
      <div class="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
        <div>
          <p class="eyebrow mb-2">Inbox</p>
          <h1 class="h2 fw-bold mb-1">Conversations</h1>
          <p class="text-muted-soft mb-0">Open a conversation and reply to messages here.</p>
        </div>
      </div>

      <p v-if="error" class="text-danger fw-semibold">{{ error }}</p>
      <div class="row g-4">
        <div class="col-lg-4">
          <div class="panel-card p-3 list-column">
            <div v-if="conversations.length === 0">
              <EmptyState title="No conversations" text="Start from a car detail page to send your first message." />
            </div>
            <button
              v-for="conversation in conversations"
              :key="conversation.id"
              class="conversation-item mb-2"
              :class="{ active: activeConversationId === Number(conversation.id) }"
              @click="$router.replace({ name: 'messages', query: { id: conversation.id } })"
            >
              <div class="fw-bold">{{ conversation.participant_name }}</div>
              <div class="small text-muted-soft">{{ conversation.latest_message || 'No messages yet.' }}</div>
            </button>
          </div>
        </div>
        <div class="col-lg-8">
          <div class="panel-card p-4">
            <div v-if="!activeConversationId">
              <EmptyState title="Select a conversation" text="Choose one from the list to read and reply." />
            </div>
            <div v-else>
              <div class="d-flex flex-column gap-3 mb-4">
                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="message-bubble"
                  :class="{ mine: Number(message.sender_id) === Number(session.user.id) }"
                >
                  <div class="fw-semibold mb-1">{{ message.sender_name }}</div>
                  <div>{{ message.body }}</div>
                  <div class="small text-muted-soft mt-2">{{ shortDate(message.created_at) }}</div>
                </div>
              </div>
              <textarea v-model="newMessage" class="surface-textarea w-100 mb-3" placeholder="Write your reply..."></textarea>
              <button class="btn btn-brand" @click="sendMessage">Send message</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};

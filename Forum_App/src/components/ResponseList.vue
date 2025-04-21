<template>
  <div class="response-list">
    <h3>Responses ({{ responses.length }})</h3>
    <div v-if="loading" class="loading-indicator">
      Loading responses...
    </div>
    <div v-else-if="!responses.length" class="no-responses">
      No responses yet. Be the first to reply!
    </div>
    <div v-else>
      <ResponseItem
        v-for="response in responses"
        :key="response.id"
        :response="response"
        @response-deleted="handleResponseDeleted"
        @response-updated="handleResponseUpdated"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import ResponseItem from './ResponseItem.vue'

export default {
  name: 'ResponseList',
  components: { ResponseItem },
  props: {
    discussionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const responses = ref([])
    const loading = ref(true)
    const error = ref(null)

    const fetchResponses = async () => {
      try {
        loading.value = true
        const q = query(
          collection(db, 'responses'),
          where('discussionId', '==', props.discussionId),
          orderBy('createdAt', 'asc') // or 'desc' for newest first
        )
        const snapshot = await getDocs(q)
        responses.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure createdAt is properly formatted
          createdAt: doc.data().createdAt || { seconds: Date.now() / 1000 }
        }))
      } catch (err) {
        console.error('Error fetching responses:', err)
        error.value = 'Failed to load responses'
      } finally {
        loading.value = false
      }
    }

    const handleResponseDeleted = (deletedResponseId) => {
      responses.value = responses.value.filter(r => r.id !== deletedResponseId)
    }

    const handleResponseUpdated = ({ id, newContent }) => {
      const responseToUpdate = responses.value.find(r => r.id === id)
      if (responseToUpdate) {
        responseToUpdate.contenu = newContent
      }
    }

    onMounted(fetchResponses)
    
    // Refetch if discussionId changes
    watch(() => props.discussionId, fetchResponses)

    return { 
      responses,
      loading,
      error,
      handleResponseDeleted,
      handleResponseUpdated
    }
  }
}
</script>

<style scoped>
.response-list {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
}

.loading-indicator {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
}

.no-responses {
  padding: 1rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

h3 {
  color: #343a40;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}
</style>
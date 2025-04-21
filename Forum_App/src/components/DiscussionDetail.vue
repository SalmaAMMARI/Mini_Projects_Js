<template>
  <div class="discussion-container">
    <NavbarDiscussion />
    <div class="discussion-detail" v-if="discussion">
      <!-- Discussion Header -->
      <div class="discussion-header">
        <div class="header-content">
          <h2 class="discussion-title">{{ discussion.title }}</h2>
          <button 
            v-if="isAdmin"
            @click="deleteDiscussion"
            class="delete-button"
            title="Delete Discussion"
          >
            <i class="fas fa-trash"></i> Delete Discussion
          </button>
        </div>
        <div class="discussion-meta">
          <span class="meta-category">
            <i class="fas fa-tag"></i> {{ discussion.category }}
          </span>
          <span class="meta-date">
            <i class="far fa-clock"></i> {{ formattedDate }}
          </span>
        </div>
      </div>

      <!-- Discussion Content -->
      <div class="discussion-content">
        <p>{{ discussion.content }}</p>
      </div>

      <!-- Response Form -->
      <ResponseForm 
        @response-added="fetchResponses" 
        :discussion-owner-id="discussion.authorId"
        class="response-form"
      />

      <!-- Responses Section -->
      <div class="responses-section">
        <h3 class="responses-title">
          <i class="fas fa-comments"></i> 
          Responses <span class="response-count">({{ responses.length }})</span>
        </h3>
        
        <div v-if="responses.length" class="responses-list">
          <ResponseItem
            v-for="response in responses"
            :key="response.id"
            :response="response"
            :class="{ 'highlight-reply': highlightedReply === response.id }"
            @response-deleted="fetchResponses"
            :is-admin="isAdmin"
            ref="responseItems" />
        </div>
        
        <div v-else class="empty-responses">
          <i class="far fa-comment-dots"></i>
          <p>No responses yet. Be the first to contribute!</p>
        </div>
      </div>
    </div>
    
    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>Loading discussion...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore'

import ResponseForm from '@/components/ResponseForm.vue'
import ResponseItem from '@/components/ResponseItem.vue'
import NavbarDiscussion from '@/components/NavbarDiscussion.vue'

export default {
  name: 'DiscussionDetail',
  components: {
    ResponseForm,
    ResponseItem,
    NavbarDiscussion
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const discussion = ref(null)
    const responses = ref([])
    const db = getFirestore()
    const loading = ref(true)
    const highlightedReply = ref(null)
    const responseItems = ref([])
    const isAdmin = ref(false)
    const authorId = ref('')

    const checkAdminStatus = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const discDoc = await getDoc(doc(db, 'discussions', route.params.id))
        if (userDoc.exists()) {
          isAdmin.value = userDoc.data().type === 'admin'
        }
        if (discDoc.exists()) {
          authorId.value = discDoc.data().authorId 
        }
        if (user.uid === authorId.value) {
          isAdmin.value = true
        }

      }
    }

    const fetchDiscussion = async () => {
      const docRef = doc(db, 'discussions', route.params.id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        discussion.value = { 
          id: docSnap.id, 
          ...docSnap.data(),
          authorId: docSnap.data().authorId
        }
      } else {
        router.push('/discussions')
      }
      loading.value = false
    }

    const fetchResponses = async () => {
      const q = query(collection(db, 'responses'), where('discussionId', '==', route.params.id))
      const snapshot = await getDocs(q)
      responses.value = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt
      }))
      
      if (route.hash) {
        const replyId = route.hash.replace('#', '')
        highlightReply(replyId)
      }
    }

    const highlightReply = (replyId) => {
      highlightedReply.value = replyId
      setTimeout(() => {
        highlightedReply.value = null
      }, 3000)
      
      nextTick(() => {
        const element = document.getElementById(replyId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }

    const deleteDiscussion = async () => {
      if (confirm('Are you sure you want to delete this discussion and all its responses?')) {
        try {
          // First delete all responses
          const q = query(collection(db, 'responses'), where('discussionId', '==', route.params.id))
          const snapshot = await getDocs(q)
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
          await Promise.all(deletePromises)
          
          // Then delete the discussion
          await deleteDoc(doc(db, 'discussions', route.params.id))
          
          router.push('/forum')
          alert('Discussion and all responses deleted successfully')
        } catch (error) {
          console.error('Error deleting discussion:', error)
          alert('Failed to delete discussion')
        }
      }
    }

    onMounted(async () => {
      await checkAdminStatus()
      await fetchDiscussion()
      await fetchResponses()
    })

    return {
      discussion,
      responses,
      fetchResponses,
      loading,
      highlightedReply,
      responseItems,
      isAdmin,
      deleteDiscussion,
      formattedDate: computed(() =>
        discussion.value && discussion.value.createdAt
          ? new Date(discussion.value.createdAt.seconds * 1000).toLocaleString()
          : ''
      )
    }
  }
}
</script>

<style scoped>
.discussion-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.discussion-detail {
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.discussion-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eaeef2;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.discussion-title {
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  font-weight: 600;
  flex-grow: 1;
}

.delete-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.delete-button:hover {
  background-color: #c0392b;
}

.discussion-meta {
  display: flex;
  gap: 1.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.meta-category, .meta-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.discussion-content {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 2.5rem;
}

.responses-section {
  margin-top: 3rem;
}

.responses-title {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.response-count {
  font-size: 1rem;
  color: #7f8c8d;
  font-weight: normal;
}

.responses-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.empty-responses {
  text-align: center;
  padding: 2rem;
  color: #95a5a6;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}

.empty-responses i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #bdc3c7;
}

.empty-responses p {
  margin-top: 0.5rem;
  font-size: 1rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  color: #7f8c8d;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

.highlight-reply {
  animation: highlight-fade 3s ease-out;
  background-color: rgba(52, 152, 219, 0.05);
  border-left: 3px solid #3498db;
  padding-left: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes highlight-fade {
  0% { background-color: rgba(52, 152, 219, 0.15); }
  100% { background-color: rgba(52, 152, 219, 0.05); }
}

@media (max-width: 768px) {
  .discussion-detail {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .discussion-title {
    font-size: 1.5rem;
  }
  
  .discussion-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .delete-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
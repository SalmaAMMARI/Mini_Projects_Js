<template>
  <div class="discussion-item">
    <div class="discussion-header">
      <h3>
        <router-link :to="`/discussion/${discussion.id}`">
          {{ discussion.title }}
        </router-link>
      </h3>
      <button 
        v-if="isAdmin"
        @click="deleteDiscussion"
        class="delete-button admin-delete"
        title="Delete Discussion"
      >
        <i class="fas fa-trash"></i> Remove
      </button>
    </div>
    <p>{{ discussion.content.slice(0, 100) }}...</p>
    <div class="meta">
      <span>Category: {{ discussion.category }}</span>
      <span>Created at: {{ formattedDate }}</span>
    
      <span v-if="isAdmin" class="admin-tag">Admin View</span>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, deleteDoc } from 'firebase/firestore'
import { checkAdminStatus } from '@/services/auth'

export default {
  props: ['discussion'],
  data() {
    return {
      isAdmin: false
    }
  },
  async created() {
    const auth = getAuth()
    const user = auth.currentUser
    if (user) {
      this.isAdmin = await checkAdminStatus(user.uid)
    }
  },
  methods: {
    async deleteDiscussion() {
      if (confirm('Are you sure you want to delete this discussion?')) {
        try {
          const db = getFirestore()
          await deleteDoc(doc(db, 'discussions', this.discussion.id))
          this.$emit('discussion-deleted', this.discussion.id)
        } catch (error) {
          console.error('Error deleting discussion:', error)
          alert('Failed to delete discussion')
        }
      }
    }
  }
}
</script>

<style scoped>
.discussion-item {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.meta {
  font-size: 0.9rem;
  color: #555;
  margin-top: 1rem;
}
</style>
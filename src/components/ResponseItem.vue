<template>
  <div 
    class="response-item" 
    :id="response.id"
    :class="{ 'highlight-reply': isHighlighted }"
  >
    <div v-if="isEditing" class="edit-mode">
      <textarea
        v-model="editedContent"
        class="edit-textarea"
        placeholder="Edit your response..."
      ></textarea>
      <div class="edit-actions">
        <button
          @click="saveResponse"
          class="save-button"
        >
          <i class="fas fa-check"></i> Save
        </button>
        <button
          @click="cancelEdit"
          class="cancel-button"
        >
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </div>
    <div v-else class="response-content">
      <p class="response-text">{{ response.contenu }}</p>
      <div class="response-meta">
        <div class="author-info">
          <i class="fas fa-user"></i>
          <span>{{ response.authorName || response.authorId }}</span>
        </div>
        <div class="date-info">
          <i class="far fa-clock"></i>
          <span>{{ formattedDate }}</span>
          <span v-if="response.updatedAt" class="edited-badge">(edited)</span>
        </div>
      </div>

      <div v-if="isAuthor || isAdmin" class="response-actions">
        <button
          v-if="isAuthor"
          @click="editResponse"
          class="edit-button"
        >
          <i class="fas fa-edit"></i> Edit
        </button>
        <button
          @click="deleteResponse"
          class="delete-button"
        >
          <i class="fas fa-trash"></i> Delete
        </button>
        <span v-if="isAdmin && !isAuthor" class="admin-badge">Admin Action</span>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth } from 'firebase/auth'
import { getFirestore, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'ResponseItem',
  props: {
    response: Object,
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  emits: ['response-deleted', 'response-updated'],
  setup(props, { emit }) {
    const db = getFirestore()
    const auth = getAuth()
    const route = useRoute()

    // State for the editing process
    const isEditing = ref(false)
    const editedContent = ref(props.response.contenu)
    const isHighlighted = ref(false)

    // Check if the current user is the author
    const isAuthor = computed(() => {
      return auth.currentUser && auth.currentUser.uid === props.response.authorId
    })

    // Format the creation date
    const formattedDate = computed(() => {
      if (!props.response.createdAt) return ''
      const date = props.response.createdAt.toDate 
        ? props.response.createdAt.toDate() 
        : new Date(props.response.createdAt.seconds * 1000)
      return date.toLocaleString()
    })

    // Check if this response should be highlighted from URL hash
    const checkHighlight = () => {
      if (route.hash === `#${props.response.id}`) {
        isHighlighted.value = true
        setTimeout(() => {
          isHighlighted.value = false
        }, 3000)
      }
    }

    // Edit button click handler
    const editResponse = () => {
      isEditing.value = true
    }

    // Save the edited response to Firestore
    const saveResponse = async () => {
      try {
        const responseRef = doc(db, 'responses', props.response.id)
        await updateDoc(responseRef, {
          contenu: editedContent.value,
          updatedAt: serverTimestamp() // Use serverTimestamp for consistency
        })
        
        // Update local state
        props.response.contenu = editedContent.value
        props.response.updatedAt = new Date() // Update local copy
        emit('response-updated', { 
          id: props.response.id, 
          newContent: editedContent.value 
        })
        isEditing.value = false
      } catch (error) {
        console.error('Error saving response:', error)
        alert('Failed to save response: ' + error.message)
      }
    }

    // Cancel editing
    const cancelEdit = () => {
      isEditing.value = false
      editedContent.value = props.response.contenu
    }

    // Delete the response from Firestore
    const deleteResponse = async () => {
      const message = props.isAdmin && !isAuthor.value 
        ? 'Are you sure you want to delete this response as admin?'
        : 'Are you sure you want to delete your response?'
      
      if (confirm(message)) {
        try {
          await deleteDoc(doc(db, 'responses', props.response.id))
          emit('response-deleted', props.response.id)
        } catch (error) {
          console.error('Error deleting response:', error)
          alert('Failed to delete response: ' + error.message)
        }
      }
    }

    onMounted(() => {
      checkHighlight()
    })

    return {
      deleteResponse,
      editResponse,
      saveResponse,
      cancelEdit,
      isAuthor,
      isEditing,
      isHighlighted,
      editedContent,
      formattedDate
    }
  }
}
</script>

<style scoped>
.response-item {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 3px solid transparent;
}

.response-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.highlight-reply {
  animation: highlight-fade 3s ease-out;
  border-left-color: #3498db;
  background-color: rgba(52, 152, 219, 0.03);
}

.edit-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.edit-textarea {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 120px;
  transition: border-color 0.3s;
  resize: vertical;
}

.edit-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.edit-actions {
  display: flex;
  gap: 0.75rem;
}

.save-button, .cancel-button,
.edit-button, .delete-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.save-button {
  background-color: #28a745;
  color: white;
}

.save-button:hover {
  background-color: #218838;
}

.cancel-button {
  background-color: #6c757d;
  color: white;
}

.cancel-button:hover {
  background-color: #5a6268;
}

.response-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.response-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.author-info, .date-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edited-badge {
  color: #95a5a6;
  font-style: italic;
  margin-left: 0.3rem;
}

.response-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.edit-button {
  background-color: #007bff;
  color: white;
}

.edit-button:hover {
  background-color: #0069d9;
}

.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.admin-badge {
  font-size: 0.75rem;
  color: #6c757d;
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

@keyframes highlight-fade {
  0% { 
    background-color: rgba(52, 152, 219, 0.1);
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
  100% { 
    background-color: rgba(52, 152, 219, 0.03);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

@media (max-width: 768px) {
  .response-item {
    padding: 1.25rem;
  }
  
  .response-meta {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .edit-textarea {
    min-height: 100px;
  }

  .response-actions {
    flex-wrap: wrap;
  }
}
</style>
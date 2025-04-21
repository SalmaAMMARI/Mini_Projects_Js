<template>
  <form @submit.prevent="addResponse" style="margin-top: 1.5rem;">
    <textarea
      v-model="contenu"
      placeholder="Write your response..."
      style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #ccc;"
    ></textarea>
    <button
      type="submit"
      :disabled="isSubmitting"
      style="margin-top: 0.5rem; padding: 0.5rem 1rem; background-color: #007BFF; color: white; border: none; border-radius: 0.5rem; cursor: pointer;"
    >
      {{ isSubmitting ? 'Posting...' : 'Post Response' }}
    </button>
    <p v-if="error" style="color: red; margin-top: 0.5rem;">{{ error }}</p>
  </form>
</template>

<script>
import { ref } from 'vue'
import { getAuth } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { useRoute } from 'vue-router'

export default {
  name: 'NewResponseForm',
  props: {
    discussionOwnerId: {  // Add this prop to receive discussion owner's ID
      type: String,
      required: true
    }
  },
  emits: ['response-added'],
  setup(props, { emit }) {
    const contenu = ref('')
    const db = getFirestore()
    const auth = getAuth()
    const route = useRoute()
    const isSubmitting = ref(false)
    const error = ref(null)

    const addResponse = async () => {
      const user = auth.currentUser
      if (!user || !contenu.value.trim()) return

      isSubmitting.value = true
      error.value = null

      try {
        // 1. Add the response to Firestore
        const responseRef = await addDoc(collection(db, 'responses'), {
          contenu: contenu.value,
          discussionId: route.params.id,
          authorId: user.uid,
          authorName: user.displayName || 'Anonymous', // Added author name
          createdAt: serverTimestamp()
        })

        // 2. Send notification (only if not replying to yourself)
        if (user.uid !== props.discussionOwnerId) {
          await createNotification(
            props.discussionOwnerId,
            user,
            route.params.id,
            responseRef.id
          )
        }

        // 3. Clear form and emit event
        contenu.value = ''
        emit('response-added')
      } catch (err) {
        console.error('Error adding response:', err)
        error.value = 'Failed to post response. Please try again.'
      } finally {
        isSubmitting.value = false
      }
    }

    // Notification creation function
    const createNotification = async (ownerId, currentUser, discussionId, replyId) => {
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: ownerId,
          type: 'reply',
          read: false,
          createdAt: serverTimestamp(),
          data: {
            discussionId: discussionId,
            replyId: replyId,
            replierName: currentUser.displayName || 'Anonymous',
            replierId: currentUser.uid,
            contentPreview: contenu.value.substring(0, 100) // First 100 chars of reply
          }
        })
      } catch (err) {
        console.error('Error creating notification:', err)
        // Don't block the response if notification fails
      }
    }

    return {
      contenu,
      addResponse,
      isSubmitting,
      error
    }
  }
}
</script>
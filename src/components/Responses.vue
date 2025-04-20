<template>
  <div v-if="discussionId">
    <button @click="Hide" class="back-button">
      <span class="back-icon">←</span> Retour aux discussions
    </button>
    <div v-if="discussion" class="chat-container">
      <!-- Updated discussion info and participants section -->
      <div class="discussion-header">
        <h2>{{ discussion.title }}</h2>
        <p v-if="discussion.description">{{ discussion.description }}</p>
      </div>
      
      <!-- Condensed participants display -->
      <div class="participants-bar">
        <div class="participants-label">Participants</div>
        <div class="participants-list">
          <div v-for="userId in discussion.participants" :key="userId" 
               class="participant-item">
            <div class="participant-avatar">
              <img v-if="userAvatars[userId]" :src="userAvatars[userId]" alt="Avatar" class="avatar-img">
              <div v-else class="user-initials">{{ getUserInitials(userId) }}</div>
              <div class="status-indicator" :class="{ 'online': isUserOnline(userId), 'offline': !isUserOnline(userId) }"></div>
            </div>
            <div class="participant-name">
              {{ isCurrentUser(userId) ? 'Vous' : (userNames[userId] || 'Utilisateur') }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="messages-container" ref="messagesContainer" @scroll="handleScroll">
        <div v-if="responses.length === 0" class="no-messages">
          Aucun message dans cette discussion. Soyez le premier à écrire !
        </div>
        
        <div v-for="message in responses" :key="message.id"
              :class="{'sender-message': isCurrentUserMessage(message), 'receiver-message': !isCurrentUserMessage(message)}"
              class="message"
              :data-message-id="message.id"
              ref="messageElements">
          <!-- User profile picture -->
          <div class="message-avatar">
            <div class="user-avatar">
              <img v-if="userAvatars[message.senderId]" :src="userAvatars[message.senderId]" alt="Avatar" class="avatar-img">
              <div v-else class="avatar-placeholder">{{ getUserInitials(message.senderId) }}</div>
            </div>
          </div>
          
          <div class="message-bubble">
            <!-- Message content - show edit interface if editing this message -->
            <div v-if="editingMessageId === message.id" class="edit-message-container">
              <textarea 
                v-model="editMessageContent" 
                class="edit-message-input"
                ref="editTextarea"
                @keyup.enter.exact="saveMessageEdit(message.id)"
                @keyup.escape="cancelMessageEdit"
              ></textarea>
              <div class="edit-actions">
                <button @click="saveMessageEdit(message.id)" class="edit-save-btn">Enregistrer</button>
                <button @click="cancelMessageEdit" class="edit-cancel-btn">Annuler</button>
              </div>
            </div>
            <div v-else class="message-content">
              {{message.content}}
              <span v-if="message.edited" class="edited-indicator">(modifié)</span>
            </div>
            
            <!-- Message reactions -->
            <div class="message-reactions">
              <!-- Display existing reactions -->
              <div v-if="message.reactions && Object.keys(message.reactions).length > 0" class="reactions-list">
                <div v-for="(users, emoji) in message.reactions" :key="emoji" 
                     class="reaction-badge" 
                     :class="{ 'user-reacted': hasUserReacted(message, emoji) }"
                     @click="toggleReaction(message.id, emoji)">
                  <span class="reaction-emoji">{{ emoji }}</span>
                  <span class="reaction-count">{{ Object.keys(users).length }}</span>
                </div>
              </div>
            </div>
            
            <div class="message-meta">
              <div class="user-info">
                <span class="user-name">{{ isCurrentUserMessage(message) ? 'Vous' : getUserDisplayName(message.senderId) }}</span>
                <span class="timestamp" v-if="message.createdAt">{{ formatDate(message.createdAt) }}</span>
              </div>
              
              <div class="message-actions" v-if="!editingMessageId">
                <!-- Edit option for own messages -->
                <button v-if="isCurrentUserMessage(message)" @click="startEditMessage(message)" class="action-btn" title="Modifier ce message">
                  <span class="edit-icon">✎</span>
                </button>
                
                <!-- Delete option for own messages -->
                <button v-if="isCurrentUserMessage(message)" @click="confirmDeleteMessage(message.id)" class="action-btn delete-btn" title="Supprimer ce message">
                  <span class="delete-icon">🗑️</span>
                </button>
                
                <!-- Reaction button for all messages -->
                <button @click="showReactionPicker(message.id)" class="action-btn" title="Réagir à ce message">
                  <span class="reaction-icon">😀</span>
                </button>
                
                <!-- Read status information for sent messages - Now always visible -->
                <div v-if="isCurrentUserMessage(message)" class="read-status" @mouseenter="showReadReceipts(message)" @mouseleave="hideReadReceipts()">
                  <span class="read-status-icon" :class="getReadStatusClass(message)">
                    <span v-if="getReadCount(message) > 0" class="read-count">{{ getReadCount(message) }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Read receipts tooltip -->
        <div v-if="showingReadReceiptsFor" class="read-receipts-tooltip" :style="readReceiptsTooltipStyle">
          <div class="read-receipts-content">
            <div v-if="getReadUsersList(showingReadReceiptsFor).length > 0">
              <strong>Lu par:</strong>
              <ul class="read-users-list">
                <li v-for="(info, index) in getReadUsersList(showingReadReceiptsFor)" :key="index" class="read-user-item">
                  <span class="read-user-name">{{ info.name }}</span>
                  <span class="read-timestamp">{{ formatDate(info.timestamp) }}</span>
                </li>
              </ul>
            </div>
            <div v-if="getUnreadUsersList(showingReadReceiptsFor).length > 0">
              <strong>Pas encore lu par:</strong>
              <ul class="unread-users-list">
                <li v-for="(name, index) in getUnreadUsersList(showingReadReceiptsFor)" :key="index" class="unread-user-item">
                  {{ name }}
                </li>
              </ul>
            </div>
            <div v-if="getReadUsersList(showingReadReceiptsFor).length === 0 && getUnreadUsersList(showingReadReceiptsFor).length === 0">
              Aucune information de lecture disponible.
            </div>
          </div>
        </div>
        
        <!-- Reaction picker overlay -->
        <div v-if="showingReactionsFor" class="reaction-picker" :style="reactionPickerStyle">
          <div class="reaction-picker-content">
            <button v-for="emoji in availableReactions" :key="emoji" 
                    class="reaction-btn" 
                    @click="addReaction(showingReactionsFor, emoji)">
              {{ emoji }}
            </button>
          </div>
        </div>
        
        <!-- Delete confirmation modal -->
        <div v-if="showDeleteConfirmation" class="delete-confirmation-modal">
          <div class="delete-modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Êtes-vous sûr de vouloir supprimer ce message ?</p>
            <div class="delete-modal-actions">
              <button @click="deleteMessage" class="delete-confirm-btn">Supprimer</button>
              <button @click="cancelDeleteConfirmation" class="delete-cancel-btn">Annuler</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="message-input-container">
        <form @submit.prevent="sendMessage" class="message-form">
          <input 
            v-model="newMessage" 
            type="text" 
            placeholder="Écrivez votre message ici..." 
            class="message-input"
          />
          <button type="submit" class="send-button">Envoyer</button>
        </form>
      </div>
    </div>
    <div v-else class="loading">
      Chargement de la discussion...
    </div>
  </div>
  <div v-else class="no-discussion-selected">
    Sélectionnez une discussion pour voir les messages
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, onUnmounted, computed } from 'vue';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  addDoc, 
  setDoc,
  arrayUnion,
  arrayRemove,
  deleteField,
  deleteDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default {
  props: {
    discussionId: {
      type: String,
      default: null
    }
  },
  emits: ['hide-discussion'],
  setup(props, { emit }) {
    const discussion = ref(null);
    const responses = ref([]);
    const userNames = ref({});
    const userAvatars = ref({}); 
    const userStatuses = ref({});
    const newMessage = ref('');
    const messagesContainer = ref(null);
    const messageElements = ref([]);
    const isScrolledToBottom = ref(true);
    
    // Variables for tracking seen status
    const unreadMessages = ref(new Set());
    const lastVisibleMessageId = ref(null);
    
    // Pour message editing
    const editingMessageId = ref(null);
    const editMessageContent = ref('');
    const editTextarea = ref(null);
    
    // Pour reactions
    const availableReactions = ref(['👍', '❤️', '😂', '😮', '😢', '👏', '🎉', '🤔']);
    const showingReactionsFor = ref(null);
    const reactionPickerPosition = ref({ top: 0, left: 0 });
    
    // Pour read receipts tooltip
    const showingReadReceiptsFor = ref(null);
    const readReceiptsTooltipPosition = ref({ top: 0, left: 0 });
    
    // Pour presence system
    const presenceUnsubscribe = ref(null);
    const userStatusInterval = ref(null);
    const messagesUnsubscribe = ref(null);
    
    // Pour la suppression de message
    const showDeleteConfirmation = ref(false);
    const messageToDelete = ref(null);
    
    // Computed style for reaction picker positioning
    const reactionPickerStyle = computed(() => {
      return {
        top: `${reactionPickerPosition.value.top}px`,
        left: `${reactionPickerPosition.value.left}px`
      };
    });
    
    // Computed style for read receipts tooltip positioning
    const readReceiptsTooltipStyle = computed(() => {
      return {
        top: `${readReceiptsTooltipPosition.value.top}px`,
        left: `${readReceiptsTooltipPosition.value.left}px`
      };
    });
    
    const Hide = () => {
      emit('hide-discussion');
    };

    const isCurrentUser = (userId) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      return currentUser && currentUser.uid === userId;
    };

    const isCurrentUserMessage = (message) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      return currentUser && currentUser.uid === message.senderId;
    };
    
    // Generate user initials for avatar placeholder
    const getUserInitials = (userId) => {
      // If it's current user and we don't have their name yet
      if (isCurrentUser(userId)) {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.displayName) {
          const nameParts = currentUser.displayName.split(' ');
          if (nameParts.length >= 2) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
          } else if (nameParts.length === 1) {
            return nameParts[0][0].toUpperCase();
          }
        }
        return 'V'; // Vous (default for current user)
      }
      
      // For other users, use their name if we have it
      if (userNames.value[userId]) {
        const nameParts = userNames.value[userId].split(' ');
        if (nameParts.length >= 2) {
          return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        } else if (nameParts.length === 1) {
          return nameParts[0][0].toUpperCase();
        }
      }
      
      return 'U'; // Unknown (default)
    };
    const isUserOnline = (userId) => {
  return userStatuses.value[userId]?.isOnline || false;
};
    const formatDate = (timestamp) => {
      if (!timestamp) return '';
      
      try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        
        const today = new Date();
        const isToday = date.getDate() === today.getDate() && 
                         date.getMonth() === today.getMonth() && 
                         date.getFullYear() === today.getFullYear();
        
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        
        if (isToday) {
          return `Aujourd'hui, ${date.toLocaleTimeString(undefined, timeOptions)}`;
        } else {
          return date.toLocaleDateString(undefined, dateOptions) + ', ' + 
                 date.toLocaleTimeString(undefined, timeOptions);
        }
      } catch (e) {
        console.error("Error formatting date:", e);
        return '';
      }
    };
    
    // Handle scroll to track when user is viewing messages
    const handleScroll = () => {
      if (!messagesContainer.value) return;
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
      isScrolledToBottom.value = Math.abs(scrollHeight - clientHeight - scrollTop) < 20;
      
      // Mark messages as read when they appear in viewport
      markVisibleMessagesAsRead();
    };
    
    // Scroll to bottom with optional force parameter
    const scrollToBottom = async (force = false) => {
      await nextTick();
      if (messagesContainer.value && (isScrolledToBottom.value || force)) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    };
    
    // Function to mark visible messages as read
    const markVisibleMessagesAsRead = () => {
      if (!messagesContainer.value || responses.value.length === 0) return;
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
       const containerRect = messagesContainer.value.getBoundingClientRect();
      // Get all message elements
      if (!messageElements.value) return;
      let messagesElements = Array.isArray(messageElements.value) 
        ? messageElements.value 
        : [messageElements.value];
      
      let messageIds = [];
      
      // Check which messages are visible
      messagesElements.forEach(el => {
        if (!el) return;
        
        const rect = el.getBoundingClientRect();
        // Check if element is at least partially visible in container
        if (rect.top < containerRect.bottom && rect.bottom > containerRect.top) {
          const messageId = el.getAttribute('data-message-id');
          if (messageId) {
            messageIds.push(messageId);
          }
        }
      });
      // Mark all visible messages as read
      if (messageIds.length > 0) {
        messageIds.forEach(messageId => {
          const message = responses.value.find(msg => msg.id === messageId);
          // Only mark others' messages as read
          if (message && message.senderId !== currentUser.uid) {
            markMessageAsRead(messageId);
          }
        });
      }
    };
    // Function to mark a message as read
    const markMessageAsRead = async (messageId) => {
      if (!messageId || !props.discussionId) return;
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      try {
        const message = responses.value.find(msg => msg.id === messageId);
        
        // Skip if message is from current user or already read by current user
        if (!message || 
            message.senderId === currentUser.uid || 
            (message.readBy && message.readBy.includes(currentUser.uid))) {
          return;
        }
        
        const db = getFirestore();
        const messageRef = doc(db, 'discussions', props.discussionId, 'messages', messageId);
        
        // Update both readBy array and lastReadAt map
        await updateDoc(messageRef, {
          readBy: arrayUnion(currentUser.uid),
          [`lastReadAt.${currentUser.uid}`]: serverTimestamp()
        });
        
        // Update locally if needed
        if (message && !message.readBy) {
          message.readBy = [currentUser.uid];
        } else if (message && !message.readBy.includes(currentUser.uid)) {
          message.readBy.push(currentUser.uid);
        }
        
        if (!message.lastReadAt) {
          message.lastReadAt = {};
        }
        message.lastReadAt[currentUser.uid] = new Date();
        
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    };
    
    // Get read status class for message indicators
    const getReadStatusClass = (message) => {
      if (!message.readBy) return 'not-read';
      
      // If sent by current user, check if others have read it
      if (isCurrentUserMessage(message)) {
        const readCount = getReadCount(message);
        if (readCount === 0) return 'not-read';
        if (readCount < (discussion.value.participants.length - 1)) return 'partially-read';
        return 'all-read';
      }
      
      // If received, check if current user has read it
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser && message.readBy.includes(currentUser.uid)) {
        return 'read';
      }
      
      return 'not-read';
    };
    
    // Get number of users who've read a message (excluding sender)
    const getReadCount = (message) => {
      if (!message.readBy || !Array.isArray(message.readBy)) return 0;
      
      // Count users who have read the message (excluding the sender)
      return message.readBy.filter(userId => userId !== message.senderId).length;
    };
    
    // Get list of users who have read the message with timestamps
    const getReadUsersList = (message) => {
      if (!message || !message.readBy || !Array.isArray(message.readBy) || !message.lastReadAt) {
        return [];
      }
      
      return message.readBy
        .filter(userId => userId !== message.senderId) // Exclude sender
        .map(userId => ({
          userId,
          name: isCurrentUser(userId) ? 'Vous' : (userNames.value[userId] || 'Utilisateur'),
          timestamp: message.lastReadAt[userId]
        }))
        .sort((a, b) => {
          // Sort by timestamp if available
          if (a.timestamp && b.timestamp) {
            const timeA = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const timeB = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return timeA - timeB;
          }
          return 0;
        });
    };
    
    // Get list of users who haven't read the message yet
    const getUnreadUsersList = (message) => {
      if (!message || !discussion.value || !discussion.value.participants) {
        return [];
      }
      
      // Create a set of user IDs who have read the message
      const readBySet = new Set(message.readBy || []);
      
      // Return names of users who haven't read the message (excluding the sender)
      return discussion.value.participants
        .filter(userId => userId !== message.senderId && !readBySet.has(userId))
        .map(userId => isCurrentUser(userId) ? 'Vous' : (userNames.value[userId] || 'Utilisateur'));
    };
    
    // Show read receipts tooltip
    const showReadReceipts = (message) => {
      showingReadReceiptsFor.value = message;
      
      // Position the tooltip
      nextTick(() => {
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement && messagesContainer.value) {
          const rect = messageElement.getBoundingClientRect();
          const containerRect = messagesContainer.value.getBoundingClientRect();
          
          readReceiptsTooltipPosition.value = {
            top: rect.bottom - containerRect.top + 5,
            left: rect.right - containerRect.left - 150 // Position from right side
          };
        }
      });
    };
    
    // Hide read receipts tooltip
    const hideReadReceipts = () => {
      showingReadReceiptsFor.value = null;
    };
    
    // Improved function to get user's full name and profile picture from Firestore
    const fetchUserInfo = async (userId) => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser && currentUser.uid === userId) {
          let profilePicture = currentUser.photoURL;
          let fullName = currentUser.displayName || '';
          const db = getFirestore();
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Get full name if not already available
            if (!fullName) {
              fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            }
            
            // Profile picture - use profileImageUrl attribute
            if (userData.profileImageUrl) {
              profilePicture = userData.profileImageUrl;
            }
          }
          
          return { fullName, profilePicture };
        } else {
          // For other users, check Firestore
          const db = getFirestore();
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            // Get full name
            const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
            
            // Get profile picture URL - use profileImageUrl attribute
            const profilePicture = userData.profileImageUrl || null;
            
            return { fullName, profilePicture };
          }
        }
        return { fullName: null, profilePicture: null };
      } catch (error) {
        console.error(`Error fetching user info for ${userId}:`, error);
        return { fullName: null, profilePicture: null };
      }
    };
    
    // Get user display name with caching
    const getUserDisplayName = (userId) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === userId) {
        return 'Vous';
      }
      
      if (userNames.value[userId]) {
        return userNames.value[userId];
      }
      
      // Otherwise fetch it and update cache
      fetchUserInfo(userId).then(userInfo => {
        if (userInfo.fullName) {
          userNames.value[userId] = userInfo.fullName;
        } else {
          userNames.value[userId] = userId;
        }
        
        // Also update avatar if available
        if (userInfo.profilePicture) {
          userAvatars.value[userId] = userInfo.profilePicture;
        }
      }).catch(() => {
        userNames.value[userId] = userId; 
      });
      
      return userNames.value[userId] || 'Chargement...';
    };
    
    // Load all user info for participants with refreshed data
    const loadAllUserInfo = async (userIds) => {
      const uniqueIds = [...new Set(userIds)];
      for (const userId of uniqueIds) {
        const userInfo = await fetchUserInfo(userId);
        
        if (userInfo.fullName) {
          userNames.value[userId] = userInfo.fullName;
        } else {
          userNames.value[userId] = userId;
        }
        
        if (userInfo.profilePicture) {
          userAvatars.value[userId] = userInfo.profilePicture;
        }
      }

      // Make sure current user's info is up to date
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userInfo = await fetchUserInfo(currentUser.uid);
        if (userInfo.profilePicture) {
          userAvatars.value[currentUser.uid] = userInfo.profilePicture;
        } else if (currentUser.photoURL) {
          userAvatars.value[currentUser.uid] = currentUser.photoURL;
        }
      }
    };
    
    // Message editing functions
    const startEditMessage = async (message) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== message.senderId) {
        return; 
      }
      editingMessageId.value = message.id;
      editMessageContent.value = message.content;
      
      // Focus the edit textarea after it renders
      await nextTick();
      if (editTextarea.value) {
        if (Array.isArray(editTextarea.value)) {
          if (editTextarea.value[0]) {
            editTextarea.value[0].focus();
          }
        } else {
          editTextarea.value.focus();
        }
      }
    };
    
    const saveMessageEdit = async (messageId) => {
      if (!editMessageContent.value.trim()) {
        return; // Don't save empty messages
      }
      
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          alert("Vous devez être connecté pour modifier un message");
          return;
        }
        
        const db = getFirestore();
        const messageRef = doc(db, 'discussions', props.discussionId, 'messages', messageId);
        
        await updateDoc(messageRef, {
          content: editMessageContent.value.trim(),
          edited: true,
          editedAt: serverTimestamp()
        });
        
        // Reset editing state
        editingMessageId.value = null;
        editMessageContent.value = '';
      } catch (error) {
        console.error("Erreur lors de la modification du message:", error);
        alert("Une erreur s'est produite lors de la modification du message");
      }
    };
    
    const cancelMessageEdit = () => {
      editingMessageId.value = null;
      editMessageContent.value = '';
    };
    
    // Message deletion functions
    const confirmDeleteMessage = (messageId) => {
      messageToDelete.value = messageId;
      showDeleteConfirmation.value = true;
    };
    
    const cancelDeleteConfirmation = () => {
      messageToDelete.value = null;
      showDeleteConfirmation.value = false;
    };
    
    const deleteMessage = async () => {
      if (!messageToDelete.value) return;
      
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          alert("Vous devez être connecté pour supprimer un message");
          return;
        }
        
        const message = responses.value.find(msg => msg.id === messageToDelete.value);
        
        // Verify user owns this message
        if (!message || message.senderId !== currentUser.uid) {
          alert("Vous ne pouvez supprimer que vos propres messages");
          cancelDeleteConfirmation();
          return;
        }
        
        const db = getFirestore();
        const messageRef = doc(db, 'discussions', props.discussionId, 'messages', messageToDelete.value);
        
        // Delete the message document
        await deleteDoc(messageRef);
        
        // If this was the last message in the discussion, update the discussion's lastActivity
        const lastMessage = responses.value[responses.value.length - 1];
        if (lastMessage && lastMessage.id === messageToDelete.value) {
          // Find the new last message
          const newLastMessage = responses.value[responses.value.length - 2];
          
          if (newLastMessage) {
            // Update discussion with info from the new last message
            await updateDoc(doc(db, 'discussions', props.discussionId), {
              lastActivity: newLastMessage.createdAt,
              lastMessageSenderId: newLastMessage.senderId,
              lastMessageText: newLastMessage.content.substring(0, 100)
            });
          } else {
            // No messages left in the discussion
            await updateDoc(doc(db, 'discussions', props.discussionId), {
              lastActivity: serverTimestamp(),
              lastMessageSenderId: null,
              lastMessageText: null
            });
          }
        }
        // Close confirmation modal and clear state
        cancelDeleteConfirmation();
      } catch (error) {
        console.error("Erreur lors de la suppression du message:", error);
        alert("Une erreur s'est produite lors de la suppression du message");
        cancelDeleteConfirmation();
      }
    };
    
    // Message reaction functions
    const showReactionPicker = (messageId) => {
      showingReactionsFor.value = messageId;
      
      // Position the picker
      nextTick(() => {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement && messagesContainer.value) {
          const rect = messageElement.getBoundingClientRect();
          const containerRect = messagesContainer.value.getBoundingClientRect();
          
          reactionPickerPosition.value = {
            top: rect.bottom - containerRect.top + 5,
            left: rect.left - containerRect.left
          };
        }
      });
    };
    
    const addReaction = async (messageId, emoji) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        alert("Vous devez être connecté pour réagir à un message");
        return;
      }
      
      try {
        const db = getFirestore();
        const messageRef = doc(db, 'discussions', props.discussionId, 'messages', messageId);
        
        // Toggle reaction (add if not present, remove if already added)
        const message = responses.value.find(msg => msg.id === messageId);
        const hasReacted = hasUserReacted(message, emoji);
        
        if (hasReacted) {
          // Remove the reaction
          await updateDoc(messageRef, {
            [`reactions.${emoji}.${currentUser.uid}`]: deleteField()
          });
          
          // If there are no other users with this reaction, delete the entire emoji entry
          if (message && message.reactions && message.reactions[emoji]) {
            const usersWithReaction = Object.keys(message.reactions[emoji]).filter(id => id !== currentUser.uid);
            if (usersWithReaction.length === 0) {
              await updateDoc(messageRef, {
                [`reactions.${emoji}`]: deleteField()
              });
            }
          }
        } else {
          // Add the reaction with timestamp
          await updateDoc(messageRef, {
            [`reactions.${emoji}.${currentUser.uid}`]: serverTimestamp()
          });
        }
        
        // Close reaction picker
        showingReactionsFor.value = null;
      } catch (error) {
        console.error("Erreur lors de l'ajout d'une réaction:", error);
      }
    };
    
    const toggleReaction = (messageId, emoji) => {
      addReaction(messageId, emoji);
    };
    
    const hasUserReacted = (message, emoji) => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser || !message || !message.reactions || !message.reactions[emoji]) {
        return false;
      }
      
      return !!message.reactions[emoji][currentUser.uid];
    };
    
    // Send message
    const sendMessage = async () => {
      if (!newMessage.value.trim()) {
        return; // Don't send empty messages
      }
      
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          alert("Vous devez être connecté pour envoyer un message");
          return;
        }
        
        const db = getFirestore();
        
        // Add message to the discussion
        const messageRef = await addDoc(collection(db, 'discussions', props.discussionId, 'messages'), {
          content: newMessage.value.trim(),
          senderId: currentUser.uid,
          createdAt: serverTimestamp(),
          readBy: [currentUser.uid], // Mark as read by sender
          lastReadAt: {
            [currentUser.uid]: serverTimestamp()
          }
        });
        
        // Update discussion with new last activity
        await updateDoc(doc(db, 'discussions', props.discussionId), {
          lastActivity: serverTimestamp(),
          lastMessageSenderId: currentUser.uid,
          lastMessageText: newMessage.value.trim().substring(0, 100)
        });
        
        // Clear input
        newMessage.value = '';
        
        // Force scroll to bottom for new messages
        scrollToBottom(true);
      } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        alert("Une erreur s'est produite lors de l'envoi du message");
      }
    };
    
    // User presence handling
    const updateUserPresence = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser || !props.discussionId) return;
      
      try {
        const db = getFirestore();
        const presenceRef = doc(db, 'presence', currentUser.uid);
        
        // Update user's online status
        await setDoc(presenceRef, {
          userId: currentUser.uid,
          online: true,
          lastActive: serverTimestamp(),
          currentDiscussion: props.discussionId
        }, { merge: true });
      } catch (error) {
        console.error("Error updating presence:", error);
      }
    };
    
    // Listen for presence changes of all participants
    const listenToPresence = () => {
      if (!discussion.value || !discussion.value.participants) return;
      
      const db = getFirestore();
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      // Clear previous listener if any
      if (presenceUnsubscribe.value) {
        presenceUnsubscribe.value();
        presenceUnsubscribe.value = null;
      }
      
      // Set up listeners for all participants
      const listeners = discussion.value.participants.map(userId => {
        const presenceRef = doc(db, 'presence', userId);
        
        return onSnapshot(presenceRef, (doc) => {
          if (doc.exists()) {
            const presenceData = doc.data();
            // Update user status
            userStatuses.value[userId] = {
              isOnline: presenceData.online || false,
              lastActive: presenceData.lastActive,
              currentDiscussion: presenceData.currentDiscussion
            };
          } else {
            // User has no presence record
            userStatuses.value[userId] = {
              isOnline: false,
              lastActive: null,
              currentDiscussion: null
            };
          }
        }, (error) => {
          console.error(`Error listening to presence for ${userId}:`, error);
        });
      });
      
      // Combine unsubscribe functions
      presenceUnsubscribe.value = () => {
        listeners.forEach(unsubscribe => unsubscribe());
      };
      
      // Set current user as online immediately
      if (currentUser) {
        userStatuses.value[currentUser.uid] = {
          isOnline: true,
          lastActive: new Date(),
          currentDiscussion: props.discussionId
        };
      }
    };
    
    // Load discussion data
    const loadDiscussion = async () => {
      if (!props.discussionId) return;
      
      try {
        const db = getFirestore();
        const discussionDoc = await getDoc(doc(db, 'discussions', props.discussionId));
        
        if (discussionDoc.exists()) {
          discussion.value = { id: discussionDoc.id, ...discussionDoc.data() };
          
          // Load profile info for all participants
          if (discussion.value.participants && discussion.value.participants.length > 0) {
            await loadAllUserInfo(discussion.value.participants);
          }
          
          // Set up presence tracking
          listenToPresence();
          
          // Load messages
          loadMessages();
        } else {
          console.error("Discussion not found");
          discussion.value = null;
        }
      } catch (error) {
        console.error("Error loading discussion:", error);
        discussion.value = null;
      }
    };
    
    // Load messages with real-time updates
    const loadMessages = () => {
      if (!props.discussionId) return;
      
      // Clean up existing listener if any
      if (messagesUnsubscribe.value) {
        messagesUnsubscribe.value();
        messagesUnsubscribe.value = null;
      }
      
      const db = getFirestore();
      const messagesQuery = query(
        collection(db, 'discussions', props.discussionId, 'messages'), 
        orderBy('createdAt', 'asc')
      );
      
      // Set up the listener
      messagesUnsubscribe.value = onSnapshot(messagesQuery, (snapshot) => {
        // Check if we got results
        if (snapshot.empty) {
          responses.value = [];
          return;
        }
        
        let newMessages = [];
        let userIdsToLoad = new Set();
        
        snapshot.forEach(doc => {
          const messageData = { id: doc.id, ...doc.data() };
          newMessages.push(messageData);
          
          // Collect user IDs we need to load info for
          if (messageData.senderId) {
            userIdsToLoad.add(messageData.senderId);
          }
        });
        
        // Update messages array
        responses.value = newMessages;
        
        // Load missing user info for message senders
        loadAllUserInfo([...userIdsToLoad]);
        
        // Scroll to bottom if we're already at the bottom or for first load
        scrollToBottom();
        
        // Mark visible messages as read after a short delay
        setTimeout(() => {
          markVisibleMessagesAsRead();
        }, 1000);
      }, (error) => {
        console.error("Error loading messages:", error);
      });
    };
    
    // Watch for discussion ID changes
    watch(() => props.discussionId, (newDiscussionId, oldDiscussionId) => {
      if (newDiscussionId && newDiscussionId !== oldDiscussionId) {
        // Clear old data
        discussion.value = null;
        responses.value = [];
        
        // Load new discussion
        loadDiscussion();
      } else if (!newDiscussionId) {
        // Clear data if no discussion is selected
        discussion.value = null;
        responses.value = [];
      }
    }, { immediate: true });
    
    // Set up regular presence updates
    onMounted(() => {
      // Update presence immediately
      updateUserPresence();
      
      // Set up interval for regular updates
      userStatusInterval.value = setInterval(() => {
        updateUserPresence();
      }, 60000); // Update every minute
    });
    
    // Clean up when unmounting
    onUnmounted(() => {
      // Clear presence update interval
      if (userStatusInterval.value) {
        clearInterval(userStatusInterval.value);
        userStatusInterval.value = null;
      }
      
      // Clean up presence listener
      if (presenceUnsubscribe.value) {
        presenceUnsubscribe.value();
        presenceUnsubscribe.value = null;
      }
      
      // Clean up messages listener
      if (messagesUnsubscribe.value) {
        messagesUnsubscribe.value();
        messagesUnsubscribe.value = null;
      }
      
      // Set user as offline when leaving
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const db = getFirestore();
          const presenceRef = doc(db, 'presence', currentUser.uid);
          setDoc(presenceRef, {
            online: false,
            lastActive: serverTimestamp(),
            currentDiscussion: null
          }, { merge: true });
        } catch (error) {
          console.error("Error updating offline status:", error);
        }
      }
    });
    
    return {
      discussion,
      responses,
      userNames,
      userAvatars,
      userStatuses,
      newMessage,
      messagesContainer,
      messageElements,
      isScrolledToBottom,
      editingMessageId,
      editMessageContent,
      editTextarea,
      availableReactions,
      showingReactionsFor,
      reactionPickerStyle,
      showingReadReceiptsFor,
      readReceiptsTooltipStyle,
      showDeleteConfirmation,
      Hide,
      handleScroll,
      sendMessage,
      formatDate,
      isCurrentUser,
      isCurrentUserMessage,
      getUserInitials,
      startEditMessage,
      saveMessageEdit,
      cancelMessageEdit,
      confirmDeleteMessage,
      cancelDeleteConfirmation,
      deleteMessage,
      showReactionPicker,
      addReaction,
      toggleReaction,
      hasUserReacted,
      getReadStatusClass,
      getReadCount,
      getReadUsersList,
      getUnreadUsersList,
      showReadReceipts,
      hideReadReceipts,
      getUserDisplayName,
      isUserOnline

    };
  }
};
</script>

<style scoped>
.back-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #e0e0e0;
}

.back-icon {
  margin-right: 8px;
  font-size: 16px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.discussion-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f9f9f9;
}

.discussion-header h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
}

.discussion-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* Stylish participants bar */
.participants-bar {
  display: flex;
  padding: 10px 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f5f5f5;
  align-items: center;
}

.participants-label {
  font-weight: 500;
  margin-right: 16px;
  color: #555;
  font-size: 14px;
  white-space: nowrap;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  overflow-x: auto;
  max-width: calc(100% - 100px);
  padding-bottom: 4px;
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 80px;
}

.participant-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 4px;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-initials {
  font-weight: bold;
  color: #555;
  font-size: 16px;
}

.participant-name {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #f5f5f5;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #9e9e9e;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9f9;
}

.no-messages {
  text-align: center;
  color: #888;
  margin-top: 40px;
  font-style: italic;
}

.message {
  display: flex;
  margin-bottom: 16px;
  position: relative;
}

.message-avatar {
  margin-right: 12px;
  align-self: flex-start;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.message-bubble {
  flex: 1;
  position: relative;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 80%;
}

.sender-message .message-bubble {
  background-color: #e3f2fd;
  margin-left: auto;
}

.message-content {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}

.edited-indicator {
  font-size: 11px;
  color: #888;
  margin-left: 4px;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #888;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  font-weight: 500;
  margin-right: 8px;
}

.timestamp {
  color: #aaa;
}

.message-actions {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  color: #757575;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #424242;
}

.delete-btn:hover {
  color: #f44336;
}

/* Message reactions */
.message-reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.reactions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reaction-badge {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reaction-badge:hover {
  background-color: #e0e0e0;
}

.reaction-badge.user-reacted {
  background-color: #e3f2fd;
}

.reaction-emoji {
  margin-right: 4px;
}

.reaction-count {
  color: #666;
}

/* Reaction picker */
.reaction-picker {
  position: absolute;
  z-index: 10;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.reaction-picker-content {
  display: flex;
  padding: 6px;
  gap: 8px;
}

.reaction-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.reaction-btn:hover {
  background-color: #f0f0f0;
}

/* Read status indicators */
.read-status {
  display: flex;
  align-items: center;
  margin-left: 8px;
  position: relative;
}

.read-status-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  position: relative;
}

.not-read {
  border: 1px solid #bdbdbd;
}

.read {
  background-color: #e0e0e0;
}

.partially-read {
  background-color: #bbdefb;
}

.all-read {
  background-color: #4caf50;
  color: white;
}

.read-count {
  font-size: 10px;
  font-weight: bold;
}

/* Read receipts tooltip */
.read-receipts-tooltip {
  position: absolute;
  z-index: 10;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  width: 220px;
}

.read-receipts-content {
  padding: 12px;
  font-size: 12px;
}

.read-users-list, .unread-users-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 12px 0;
}

.read-user-item, .unread-user-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.read-user-name {
  font-weight: 500;
}

.read-timestamp {
  color: #888;
}

/* Edit message interface */
.edit-message-container {
  width: 100%;
}

.edit-message-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  justify-content: flex-end;
}

.edit-save-btn, .edit-cancel-btn {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
}

.edit-save-btn {
  background-color: #2196f3;
  color: white;
}

.edit-cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

/* Delete confirmation modal */
.delete-confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.delete-modal-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
}

.delete-modal-content h3 {
  margin-top: 0;
  color: #f44336;
}

.delete-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.delete-confirm-btn, .delete-cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.delete-confirm-btn {
  background-color: #f44336;
  color: white;
}

.delete-cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

/* Message input */
.message-input-container {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  background-color: #fff;
}

.message-form {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #2196f3;
}

.send-button {
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #1976d2;
}

.loading, .no-discussion-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
  font-style: italic;
}
</style>
<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.back-button {
  margin: 16px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  background-color: #f2f2f2;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #e5e5e5;
}

.back-icon {
  margin-right: 8px;
  font-size: 16px;
}

.discussion-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #ffffff;
}

.discussion-header h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.discussion-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.participants-bar {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eaeaea;
}

.participants-label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-right: 16px;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.participant-avatar {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #e1e1f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #5a5ad2;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #f9f9f9;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #bdbdbd;
}

.participant-name {
  font-size: 14px;
  color: #444;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9fb;
  scrollbar-width: thin;
  scrollbar-color: #d4d4d4 #f9f9fb;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f9f9fb;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #d4d4d4;
  border-radius: 10px;
}

.no-messages {
  text-align: center;
  margin: 40px 0;
  color: #888;
  font-style: italic;
}

.message {
  display: flex;
  margin-bottom: 16px;
  max-width: 85%;
}

.sender-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.receiver-message {
  margin-right: auto;
}

.message-avatar {
  margin: 0 8px;
  align-self: flex-end;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e1e1f9;
  color: #5a5ad2;
  font-weight: bold;
  font-size: 14px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  max-width: calc(100% - 60px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sender-message .message-bubble {
  background-color: #e7f3ff;
  color: #333;
  border-bottom-right-radius: 4px;
}

.receiver-message .message-bubble {
  background-color: #ffffff;
  color: #333;
  border-bottom-left-radius: 4px;
}

.message-content {
  margin-bottom: 6px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.edited-indicator {
  font-size: 12px;
  color: #a0a0a0;
  margin-left: 6px;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.user-info {
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
}

.user-name {
  margin-right: 8px;
  font-weight: 500;
}

.timestamp {
  font-size: 11px;
}

.message-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  margin-left: 6px;
  padding: 4px;
  font-size: 14px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #666;
}

.delete-btn:hover {
  color: #ff4d4f;
}

.read-status {
  display: flex;
  align-items: center;
  margin-left: 6px;
  cursor: pointer;
}

.read-status-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  position: relative;
}

.read-status-icon.not-read {
  border: 1px solid #ddd;
}

.read-status-icon.partially-read {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.read-status-icon.all-read {
  background-color: #52c41a;
  color: white;
}

.read-count {
  font-size: 10px;
  font-weight: bold;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 4px;
}

.reactions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.reaction-badge {
  display: flex;
  align-items: center;
  padding: 2px 6px;
  border-radius: 12px;
  background-color: #f0f0f0;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reaction-badge:hover {
  background-color: #e0e0e0;
}

.reaction-badge.user-reacted {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
}

.reaction-emoji {
  margin-right: 4px;
}

.reaction-count {
  font-size: 11px;
  font-weight: 500;
}

.reaction-picker {
  position: absolute;
  z-index: 10;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px;
}

.reaction-picker-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reaction-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.reaction-btn:hover {
  background-color: #f0f0f0;
}

.read-receipts-tooltip {
  position: absolute;
  z-index: 10;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  width: 220px;
  font-size: 13px;
}

.read-receipts-content {
  max-height: 200px;
  overflow-y: auto;
}

.read-users-list, .unread-users-list {
  margin: 8px 0;
  padding-left: 16px;
}

.read-user-item, .unread-user-item {
  margin-bottom: 4px;
}

.read-user-name {
  font-weight: 500;
  margin-right: 8px;
}

.read-timestamp {
  color: #999;
  font-size: 11px;
}

.edit-message-container {
  width: 100%;
}

.edit-message-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
  font-size: 14px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  gap: 8px;
}

.edit-save-btn, .edit-cancel-btn {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.edit-save-btn {
  background-color: #1890ff;
  color: white;
  border: none;
}

.edit-cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  color: #333;
}

.delete-confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.delete-modal-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.delete-modal-content h3 {
  margin-top: 0;
  font-size: 18px;
}

.delete-modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 12px;
}

.delete-confirm-btn, .delete-cancel-btn {
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.delete-confirm-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
}

.delete-cancel-btn {
  background-color: #f5f5f5;
  border: 1px solid #d9d9d9;
  color: #333;
}

.message-input-container {
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.message-form {
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #1890ff;
}

.send-button {
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #40a9ff;
}

.no-discussion-selected {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
  font-style: italic;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #888;
}
</style>
<style scoped>
/* Base styles */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 10px;
  position: relative;
}

.discussion-info {
  padding: 15px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

h2 {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  color: #333;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  position: relative;
}

.message-input-container {
  padding: 15px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
}

.message-form {
  display: flex;
  gap: 10px;
}

.message-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: border 0.3s;
}

.message-input:focus {
  border-color: #4a90e2;
}

.send-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 20px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #3a7fcb;
}

/* Message styles */
.message {
  display: flex;
  margin-bottom: 15px;
  position: relative;
}

.sender-message {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 15px;
  border-radius: 18px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sender-message .message-bubble {
  background-color: #d1e7ff;
  border-top-right-radius: 2px;
  margin-right: 10px;
}

.receiver-message .message-bubble {
  background-color: #ffffff;
  border-top-left-radius: 2px;
  margin-left: 10px;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.message-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 11px;
  color: #888;
}

.user-name {
  font-weight: 500;
  margin-right: 5px;
}

.timestamp {
  color: #aaa;
}

.no-messages {
  text-align: center;
  color: #888;
  margin-top: 40px;
}

.back-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 14px;
  padding: 10px;
  margin: 5px;
}

.back-icon {
  margin-right: 5px;
  font-size: 16px;
}

.no-discussion-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  font-size: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
}

/* User avatar styles */
.message-avatar {
  margin: 0 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.user-avatar.small {
  width: 30px;
  height: 30px;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.user-avatar.small .avatar-placeholder {
  font-size: 12px;
}

/* Message actions */
.message-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  color: #888;
  font-size: 14px;
}

.action-btn:hover {
  color: #4a90e2;
}

/* Edit message styles */
.edit-message-container {
  width: 100%;
}

.edit-message-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
  margin-bottom: 8px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.edit-save-btn, .edit-cancel-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.edit-save-btn {
  background-color: #4a90e2;
  color: white;
  border: none;
}

.edit-cancel-btn {
  background-color: transparent;
  border: 1px solid #ccc;
  color: #666;
}

.edited-indicator {
  font-size: 11px;
  color: #888;
  margin-left: 5px;
  font-style: italic;
}

/* Reaction styles */
.reaction-picker {
  position: absolute;
  z-index: 100;
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  padding: 8px;
}

.reaction-picker-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.reaction-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.reaction-btn:hover {
  background-color: #f0f0f0;
}

.message-reactions {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}

.reactions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.reaction-badge {
  display: flex;
  align-items: center;
  background-color: #f1f1f1;
  border-radius: 12px;
  padding: 3px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reaction-badge.user-reacted {
  background-color: #e1f0ff;
}

.reaction-badge:hover {
  background-color: #e5e5e5;
}

.reaction-badge.user-reacted:hover {
  background-color: #d1e6ff;
}

.reaction-emoji {
  font-size: 14px;
  margin-right: 3px;
}

.reaction-count {
  font-size: 11px;
  color: #666;
}

/* User status section */
.active-users {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.status-heading {
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
}

.user-status {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin: 0 8px;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #ccc;
}

.status-name {
  font-size: 13px;
  color: #333;
}

.status-activity {
  font-size: 12px;
  color: #888;
  font-style: italic;
  margin-left: 5px;
}
/* Participants display styling */
.discussion-header {
  padding: 15px 15px 5px 15px;
}

.participants-bar {
  padding: 5px 15px 15px 15px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #ffffff;
}

.participants-label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 10px;
}

.participants-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.participant-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.participant-avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e5e5e5;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
}

.user-initials {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.participant-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
}

.status-indicator.online {
  background-color: #4caf50;
}

.status-indicator.offline {
  background-color: #ccc;
}

/* You can add additional responsive adjustments if needed */
@media (max-width: 640px) {
  .participants-list {
    gap: 5px;
  }
  
  .participant-item {
    width: 50px;
  }
  
  .participant-avatar {
    width: 35px;
    height: 35px;
  }
  
  .user-initials {
    font-size: 12px;
  }
  
  .participant-name {
    font-size: 11px;
  }
}

</style>
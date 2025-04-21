<template>
  <div class="navbar">
    <div class="container">
      <router-link to="/forum" class="logo">
        <i class="fas fa-comments"></i> Forum
      </router-link>
      
      <div class="nav-right">
        <!-- Notifications Dropdown -->
        <div class="notification-icon" @click.stop="toggleNotifications" v-if="user">
          <i class="fas fa-bell"></i>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          
          <div v-if="showNotifications" class="notification-dropdown">
            <div class="notification-header">
              <h4>Notifications</h4>
              <button @click="markAllAsRead" v-if="unreadCount > 0">
                Mark all as read
              </button>
            </div>
            
            <div v-if="loadingNotifications" class="loading">
              <i class="fas fa-spinner fa-spin"></i> Loading...
            </div>
            
            <div v-else>
              <div v-if="notifications.length === 0" class="empty">
                No new notifications
              </div>
              
              <div v-for="notification in notifications" 
                   :key="notification.id"
                   class="notification-item"
                   :class="{ unread: !notification.read }"
                   @click="handleNotificationClick(notification)">
                <img :src="notification.senderAvatar || defaultAvatar" 
                     class="avatar"
                     @error="handleAvatarError">
                <div class="content">
                  <p><strong>{{ notification.senderName }}</strong> {{ notification.message }}</p>
                  <small>{{ formatTime(notification.timestamp) }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- User Profile -->
        <div class="user-profile" v-if="user" @click.stop="toggleProfileDropdown">
          <!-- Avatar with user initials and dynamic background color -->
          <div class="initials-avatar" :style="{ backgroundColor: userAvatarColor, color: '#ffffff' }">
            {{ userInitials }}
          </div>
          <span>{{ userDisplayName }}</span>
          <i class="fas fa-caret-down"></i>
          
          <div v-if="showProfileDropdown" class="profile-dropdown">
            <router-link to="/profile" class="dropdown-item">
              <i class="fas fa-user"></i> Profile
            </router-link>
            <div class="dropdown-item" @click="logout">
              <i class="fas fa-sign-out-alt"></i> Logout
            </div>
          </div>
        </div>
        
        <router-link v-else to="/login" class="login-btn">
          <i class="fas fa-sign-in-alt"></i> Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, getDoc, updateDoc, writeBatch } from "firebase/firestore";
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'Navbar',
  setup() {
    const auth = getAuth();
    const db = getFirestore();
    const router = useRouter();
    
    // User data
    const user = ref(null);
    const userProfile = ref({
      firstName: '',
      lastName: '',
      displayName: '',
      photoURL: '',
      avatarColor: '#3498db', // Default color
      uid: ''
    });
    const defaultAvatar = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
    
    // Computed properties for avatar
    const userInitials = computed(() => {
      const firstInitial = userProfile.value.firstName ? userProfile.value.firstName.charAt(0).toUpperCase() : '';
      const lastInitial = userProfile.value.lastName ? userProfile.value.lastName.charAt(0).toUpperCase() : '';
      return `${firstInitial}${lastInitial}`;
    });
    
    const userDisplayName = computed(() => {
      if (userProfile.value.displayName && userProfile.value.displayName.trim() !== '') {
        return userProfile.value.displayName;
      }
      
      const fullName = `${userProfile.value.firstName} ${userProfile.value.lastName}`.trim();
      return fullName !== '' ? fullName : 'User';
    });
    
    const userAvatarColor = computed(() => {
      return userProfile.value.avatarColor || '#3498db';
    });
    
    // Notification state
    const notifications = ref([]);
    const loadingNotifications = ref(false);
    const showNotifications = ref(false);
    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);
    
    // Profile dropdown
    const showProfileDropdown = ref(false);
    
    // Watch for auth state changes
    let unsubscribeAuth = null;
    let unsubscribeUserProfile = null;
    let unsubscribeNotifications = null;
    
    onMounted(() => {
      unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
        user.value = authUser;
        if (authUser) {
          // Set up real-time listener for user profile
          setupUserProfileListener(authUser.uid);
          setupNotificationsListener(authUser.uid);
        } else {
          // Clean up when logged out
          if (unsubscribeUserProfile) {
            unsubscribeUserProfile();
            unsubscribeUserProfile = null;
          }
          
          if (unsubscribeNotifications) {
            unsubscribeNotifications();
            unsubscribeNotifications = null;
          }
          
          // Clear data
          notifications.value = [];
          userProfile.value = {
            firstName: '',
            lastName: '',
            displayName: '',
            photoURL: '',
            avatarColor: '#3498db',
            uid: ''
          };
        }
      });
    });
    
    onUnmounted(() => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeUserProfile) unsubscribeUserProfile();
      if (unsubscribeNotifications) unsubscribeNotifications();
    });
    
    // Set up real-time listener for user profile
    const setupUserProfileListener = (userId) => {
      const userRef = doc(db, 'users', userId);
      
      unsubscribeUserProfile = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          
          // Use direct property assignment for Vue reactivity
          userProfile.value = {
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            displayName: userData.displayName || '',
            photoURL: userData.photoURL || user.value?.photoURL || '',
            avatarColor: userData.avatarColor || '#3498db',
            uid: userId
          };
          
          // Debug logging
          console.log('User profile updated:', userProfile.value);
        } else {
          // Fallback to auth data if no Firestore document
          if (user.value?.displayName) {
            const names = user.value.displayName.split(' ');
            userProfile.value = {
              firstName: names[0] || '',
              lastName: names.slice(1).join(' ') || '',
              displayName: user.value.displayName,
              photoURL: user.value.photoURL || '',
              avatarColor: '#3498db',
              uid: userId
            };
          }
        }
      }, error => {
        console.error('Error fetching user profile:', error);
      });
    };
    
    // Set up real-time listener for notifications
    const setupNotificationsListener = (userId) => {
      loadingNotifications.value = true;
      
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId)
      );
      
      unsubscribeNotifications = onSnapshot(q, async (snapshot) => {
        loadingNotifications.value = true;
        
        // Process all notifications
        const notificationsArray = [];
        
        for (const docSnapshot of snapshot.docs) {
          const data = docSnapshot.data();
          
          // Get sender info
          let senderName = 'Anonymous';
          let senderAvatar = null;
          
          try {
            const senderDoc = await getDoc(doc(db, 'users', data.senderId));
            if (senderDoc.exists()) {
              const senderData = senderDoc.data();
              senderName = senderData.displayName || 
                           `${senderData.firstName || ''} ${senderData.lastName || ''}`.trim() || 
                           'Anonymous';
              senderAvatar = senderData.photoURL || null;
            }
          } catch (error) {
            console.error('Error fetching sender info:', error);
          }
          
          notificationsArray.push({
            id: docSnapshot.id,
            senderId: data.senderId,
            senderName,
            senderAvatar,
            message: data.message || 'You have a new notification',
            read: data.read || false,
            timestamp: data.timestamp?.toDate() || new Date(),
            type: data.type || 'generic',
            relatedDocId: data.relatedDocId || null
          });
        }
        
        // Sort notifications by timestamp (newest first)
        notificationsArray.sort((a, b) => b.timestamp - a.timestamp);
        
        // Update the reactive notifications array
        notifications.value = notificationsArray;
        loadingNotifications.value = false;
      });
    };
    
    // Handle notification click
    const handleNotificationClick = async (notification) => {
      // Mark as read
      try {
        await updateDoc(doc(db, 'notifications', notification.id), {
          read: true
        });
        
        // Update local state
        const index = notifications.value.findIndex(n => n.id === notification.id);
        if (index !== -1) {
          notifications.value[index].read = true;
        }
        
        // Navigate based on notification type
        if (notification.type === 'reply' && notification.relatedDocId) {
          router.push(`/forum/${notification.relatedDocId}`);
        }
        
        showNotifications.value = false;
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    };
    
    // Mark all notifications as read
    const markAllAsRead = async () => {
      try {
        const batch = writeBatch(db);
        
        notifications.value.forEach(notification => {
          if (!notification.read) {
            const ref = doc(db, 'notifications', notification.id);
            batch.update(ref, { read: true });
          }
        });
        
        await batch.commit();
        
        // Update local state
        notifications.value = notifications.value.map(notification => ({
          ...notification,
          read: true
        }));
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    };
    
    // Format time
    const formatTime = (date) => {
      const now = new Date();
      const diff = now - date;
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      if (minutes < 1440) return `${Math.floor(minutes/60)}h ago`;
      return `${Math.floor(minutes/1440)}d ago`;
    };
    
    // Toggle dropdowns
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value;
      if (showNotifications.value) {
        showProfileDropdown.value = false;
      }
    };
    
    const toggleProfileDropdown = () => {
      showProfileDropdown.value = !showProfileDropdown.value;
      if (showProfileDropdown.value) {
        showNotifications.value = false;
      }
    };
    
    // Handle avatar errors
    const handleAvatarError = (e) => {
      e.target.src = defaultAvatar;
    };
    
    // Logout
    const logout = async () => {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-icon')) {
        showNotifications.value = false;
      }
      if (!e.target.closest('.user-profile')) {
        showProfileDropdown.value = false;
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    
    return {
      user,
      userProfile,
      userInitials,
      userDisplayName,
      userAvatarColor,
      defaultAvatar,
      notifications,
      loadingNotifications,
      showNotifications,
      unreadCount,
      showProfileDropdown,
      toggleNotifications,
      toggleProfileDropdown,
      handleNotificationClick,
      markAllAsRead,
      formatTime,
      handleAvatarError,
      logout
    };
  }
};
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  padding: 0.8rem 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  transition: all 0.3s ease;
}

.logo:hover {
  transform: translateY(-2px);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notification-icon {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e74c3c;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 40px;
  right: -100px;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eee;
}

.notification-header h4 {
  margin: 0;
  color: #333;
}

.notification-header button {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.8rem;
}

.notification-item {
  display: flex;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9f9f9;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-item .avatar,
.user-profile .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 0.8rem;
  object-fit: cover;
}

.notification-item .content {
  flex: 1;
}

.notification-item .content p {
  margin: 0 0 0.3rem 0;
  color: #333;
}

.notification-item .content small {
  color: #999;
}

.loading, .empty {
  padding: 1rem;
  text-align: center;
  color: #999;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  position: relative;
}

.user-profile span {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-dropdown {
  position: absolute;
  top: 40px;
  right: 0;
  width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  color: #333;
  text-decoration: none;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.login-btn {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  color: white;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Initial avatar styles */
.initials-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 2px solid white;
  font-size: 1rem;
}

/* Media Queries */
@media (max-width: 768px) {
  .navbar {
    padding: 0.8rem 1rem;
  }
  
  .notification-dropdown {
    width: 300px;
    right: -120px;
  }
  
  .user-profile span {
    display: none;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.5rem;
  }
  
  .notification-dropdown {
    width: 280px;
    right: -100px;
  }
}
</style>
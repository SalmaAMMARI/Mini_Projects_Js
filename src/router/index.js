import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import Forum from '../components/Forum.vue'
import DiscussionList from '../components/DiscussionList.vue'
import DiscussionDetail from '../components/DiscussionDetail.vue'

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp
  },
  {
    path:'/forum',
    name :  'Forum',
    component : Forum
  },
  {
    path: '/',
    name: 'Home',
    component: DiscussionList
  },
  {
    path: '/discussion/:id',
    name: 'DiscussionDetail',
    component: DiscussionDetail
  }, 
  {    
    path: '/create',
    name: 'CreateDiscussion',
    component: () => import('../components/NewDiscussionForm.vue')

  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../components/ForgotPassword.vue')
  }
  


];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
import { getAuth, onAuthStateChanged } from 'firebase/auth'

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.name === 'Home'; // to be changed hhh to the discussion board 

  onAuthStateChanged(auth, (user) => {
    if (requiresAuth && !user) {
      next('/');
    } else {
      next();
    }
  });
});

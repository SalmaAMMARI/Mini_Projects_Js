import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'
import forum from '../components/Forum.vue'
import profile from '../components/ProfilePage.vue'
import forgot from '../components/ForgotPage.vue'
import disc from '../components/singleDisc.vue'
import resp from '../components/Responses.vue'
import foru from '../components/forumPage.vue'

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
    path: '/forum/:id',
    name: 'Forum',
    component: forum
  },
  
  {
    path: '/profile/:id',
    name: 'Profile',
    component: profile

  }
  ,
  
  {
    path: '/forgot',
    name: 'Forgot',
    component: forgot

  },
  {
    path: '/disc/:id',
    name: 'discussion',
    component: disc

  },
  {
    path: '/resp/:id',
    name: 'responses',
    component: resp

  },
  {
    path: '/for/:id',
    name: 'forumPage',
    component: foru,
    children: [
      {
        path: '',
        components: {
          leftPanel: forum,
          rightPanel: resp
        }
      }
    ]

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

import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import AddJob from '../views/AddJob.vue'
import PostDetailView from '../views/PostDetailView.vue'

import EditJob from '../views/EditJob.vue'

const routes = [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage 
    },
    {
      path: '/add',
      name: 'AddJob',
      component: AddJob 
    },
    {
        path: '/post/:id',
        name: 'PostDetail',
        component: PostDetailView
      },{
        path:'/edit/:id',
        name:'EditPost',
        component: EditJob
      }
  ];

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
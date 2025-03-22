import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import CreatePostView from '../views/CreatePostView.vue';
import PostDetailView from '../views/PostDetailView.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/addPost', component: CreatePostView },
  { path: '/post/:id', component: PostDetailView }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 
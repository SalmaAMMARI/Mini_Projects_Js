import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/views/Home.vue';
import Books from '@/views/Books.vue';
import BookDetail from '@/components/BookDetail.vue';
import About from '@/views/About.vue';
import AddBook from '@/components/AddBook.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/books',
    name: 'Books',
    component: Books
  },
  {
    path: '/books/:id',
    name: 'BookDetail',
    component: BookDetail,
    props: true
  },
  {
    path: '/add-book',
    name: 'AddBook',
    component: AddBook
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
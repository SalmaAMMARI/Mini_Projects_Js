import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import CreatePost from '../views/CreatePostView.vue'
import PostDetail from '../views/PostDetailView.vue'
import TagsView from '../views/TagsView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage
    },
    {
        path: '/create',
        name: 'CreatePost',
        component: CreatePost
    },
    {
        path: '/post/:id',
        name: 'PostDetail',
        component: PostDetail
    },
    {
        path: '/TagsView/:tag',
        name: 'TagsView',
        component: TagsView
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
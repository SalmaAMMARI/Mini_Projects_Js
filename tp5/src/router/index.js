import {createRouter , createWebHistory} from 'vue-router'
import HomePage from '../views/HomePage.vue'
import createPost from '../views/CreatePostView.vue'
import PostDetail from '../views/PostDetailView.vue'
const routes=[
    {
        path:'/',
        name:'Home',
        component:HomePage
    },
    {
        path:'/create',
        name:'CreatePost',
        component:createPost
    },{
        path:'/post/:id',
        name:'PostDetail',
        component:PostDetail
    }
]
const router=createRouter({
    history:createWebHistory(),
    routes
})
export default router
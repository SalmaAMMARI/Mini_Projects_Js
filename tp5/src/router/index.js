import {createRouter , createWebHistory} from 'vue-router'
import HomePage from '../views/HomePage.vue'
import createPost from '../views/CreatePostView.vue'
import PostDetail from '../views/PostDetailView.vue'
import TagsTag from '../views/TagsView.vue'
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
    },
    {
        path:'/tags/:tag',
        name:'Tag',
        component:TagsTag
    }
]
const router=createRouter({
    history:createWebHistory(),
    routes
})
export default router
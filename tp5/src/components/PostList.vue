<template>
<div class="post_list">
<div  v-for="post in posts" :key="post.id">
<singlePost :post="post"></singlePost>
</div>

</div>



</template>

<script>
import SinglePost from "@/components/SinglePost.vue"
export default {
    name:"PostList",
    props:{
        posts:Array
    },
    components:{
        SinglePost
    }
}
</script>
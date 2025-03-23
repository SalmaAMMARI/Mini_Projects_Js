<template>
<div class="Post">
<h2>{{post.titre}}</h2>
<p>{{post.article.substring(0,50)}}</p>
<button  @click="gotTodetails"> Go to Details</button>
<TagCloud :tags="post.tags" ></TagCloud>

</div>

</template>
<script>
import TagCloud from "@/components/TagCloud.vue"
export default {
    name:"SinglePost",
    props:{
        post:Object
    },
    components:{
        TagCloud,

    },
    methods:{
        gotTodetails(){
            this.$router.push("/post/"+this.post.id)
        }
    }
}

</script>


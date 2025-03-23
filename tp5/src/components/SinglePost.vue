<template>
<div class="Post">
<h2>{{post.titre}}</h2>
<p>{{post.article.substring(0,50)}}</p>
<button  @click="gotTodetails"> Go to Details</button>

</div>

</template>
<script>
export default {
    name:"SinglePost",
    props:{
        post:Object
    },
    methods:{
        gotTodetails(){
            this.$router.push("/post/"+this.post.id)
        }
    }
}

</script>


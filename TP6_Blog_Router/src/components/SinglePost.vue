<template>
<div class="post">
    <h2>{{post.titre}}</h2>
    <p>{{post.article.substring(0,50)}}</p>
    <button @click="gotTodetails" class="details-button">Go to Details</button>
    <TagCloud :tagsview="post.tags"></TagCloud>
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

<style scoped>
.post {
    background-color: #fff;
    padding: 20px;
    margin: 10px 0;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post h2 {
    color: #007BFF;
    margin-bottom: 10px;
}

.post p {
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
}

.details-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #007BFF;
    color: white;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
}

.details-button:hover {
    background-color: #0056b3;
}

.tag-cloud {
    margin-top: 20px;
}
</style>
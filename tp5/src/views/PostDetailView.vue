<template>
<div class="post-detail-container">
    <h2>{{poost.titre}}</h2>
    <p>{{poost.article}}</p>
    <TagCloud :tags="poost.tags"></TagCloud>
</div>
</template>

<script>
import data from "@/db.json"
import TagCloud from "@/components/TagCloud.vue"
export default{
    name:"PostDetail",
    components:{
        TagCloud
    },
    data(){
        return{
            poost:{},
        }
    },
    created(){
        for(let post of data){
            if (post.id===parseInt(this.$route.params.id)){
                this.poost=post;
                this.test=10;
                break;
            }
        }
    }
}
</script>

<style scoped>
.post-detail-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.post-detail-container h2 {
    color: #007BFF;
    margin-bottom: 20px;
    text-align: center;
}

.post-detail-container p {
    color: #555;
    line-height: 1.6;
    margin-bottom: 20px;
}

.post-detail-container .tag-cloud {
    margin-top: 20px;
}
</style>
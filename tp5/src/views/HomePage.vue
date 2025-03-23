<template>
<div class="home-container">
    <PostList :posts="json_posts"></PostList>
</div>
</template>

<script>
import PostList from "@/components/PostList.vue"
import Data from "@/db.json"
export default {
  name:"HomePage",
  components:{
    PostList
  },
  data(){
    return{
      json_posts:[]
    }
  },
  mounted(){
    this.json_posts=Data
  }
}
</script>

<style scoped>
.home-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.home-container h1 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
}

.home-container .post-list {
    list-style-type: none;
    padding: 0;
}

.home-container .post-item {
    background-color: #fff;
    padding: 15px;
    margin: 10px 0;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.home-container .post-item h2 {
    margin: 0;
    color: #007BFF;
}

.home-container .post-item p {
    color: #555;
}
</style>
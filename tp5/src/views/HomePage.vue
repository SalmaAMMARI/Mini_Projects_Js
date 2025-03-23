<template>
<PostList :posts="json_posts"></PostList>

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
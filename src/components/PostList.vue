<template>
  <div class="post-list">
    <div v-for="post in posts" :key="post.id">
      <SinglePost :post="post" @delete-post="$emit('delete-post', $event)"></SinglePost>
    </div>
  </div>
</template>

<script>
import SinglePost from "@/components/SinglePost.vue";

export default {
  name: "PostList",
  props: {
    posts: Array
  },
  components: {
    SinglePost
  }
};
</script>

<style scoped>
.post-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
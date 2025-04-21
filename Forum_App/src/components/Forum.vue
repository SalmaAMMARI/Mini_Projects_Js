<!-- src/views/Forum.vue -->
<template>
    <div class="forum">
      <Navbar />
      <DiscussionList />
    </div>
  </template>
  
  <script>
  import Navbar from '@/components/Navbar.vue';
  import DiscussionList from '@/components/DiscussionList.vue';
  
  export default {
    name: 'ForumView',
    components: {
      Navbar,
      DiscussionList,
    }
  };
  </script>
  
  <style scoped>
  .forum {
    padding: 2rem;
  }
  </style>
  
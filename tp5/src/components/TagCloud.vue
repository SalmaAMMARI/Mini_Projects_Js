<template>
<div class="tag_cloud">
<h2>Tags</h2>
<div>
      <!-- Boucle sur chaque tag et crée un lien -->
      <router-link
        v-for="tag in tags"
        :key="tag"
        :to="`/tags/${tag}`"
        class="tag"
      >
        {{ tag }}
      </router-link>
    </div>
</div>

</template>

<script>
export default {
  name: 'TagCloud',
  props: {
    tags: {
      type: Array,
      required: true
    }
  }
};
</script>



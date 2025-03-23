<template>
  <div>
    <p>{{ koko }}</p>
    <h2>{{ poost.titre }}</h2>
    <p>{{ poost.article }}</p>
    <TagCloud :tagsview="poost.tags" />
  </div>
</template>

<script>
import data from "@/db.json"
import TagCloud from "@/components/TagCloud.vue"

export default {
  name: "TagsView",
  components: {
    TagCloud
  },
  data() {
    return {
      poost: {},
      koko: 0
    }
  },
  created() {
    for (let post of data) {
      if (post.tags.includes((this.$route.params.tag)).toString()) {
        this.poost = post;
        this.koko = 10;
        break;
      }
    }
  }
}
</script>
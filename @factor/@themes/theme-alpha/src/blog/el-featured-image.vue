<template>
  <factor-link :path="$post.link(post._id)">
    <div v-if="avatarUrl" class="featured-image" :style="style" />
  </factor-link>
</template>
<script>
export default {
  props: {
    postId: { type: String, default: "" }
  },
  computed: {
    post() {
      return this.$store.val(this.postId) || {}
    },
    avatar() {
      return this.$store.val(this.post.avatar) || {}
    },
    avatarUrl() {
      return this.avatar.url || ""
    },
    style() {
      const style = {}

      style.backgroundImage = `url(${this.avatarUrl})`

      return style
    }
  }
}
</script>
<style lang="less">
.blog-wrap {
  .featured-image {
    background-size: cover;
    background-position: 50%;
    min-height: 300px;
    height: 40vh;
    margin: 0;
    border-radius: 5px 5px 0 0;
  }
}
</style>

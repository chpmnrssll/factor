<template>
  <div class="return-link">
    <factor-link class="back" :path="$setting.get('blog.indexRoute')">
      <factor-icon icon="arrow-left" />
      <span>{{ returnLinkText }}</span>
    </factor-link>
  </div>
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
    returnLinkText() {
      return this.$setting.get("blog.returnLinkText") || "All Posts"
    }
  }
}
</script>
<style lang="less">
.return-link {
  margin-bottom: 2rem;
  .back {
    color: inherit;
    font-weight: var(--font-weight-bold);
    &:hover {
      color: var(--color-primary);
    }
  }
}
</style>
<template>
  <div class="news-single-entry">
    <div v-if="!$lodash.isEmpty(post)">
      <component
        :is="$setting.get(`news.components.${comp}`)"
        v-for="(comp, i) in $setting.get('news.layout.single')"
        :key="i"
        :post-id="post._id"
      />
    </div>
    <error-404 v-else />
  </div>
</template>
<script>
import Factor from "vue"
export default {
  data() {
    return {}
  },
  metatags() {
    return {
      title: this.$metatags.titleTag(this.post._id),
      description: this.$metatags.descriptionTag(this.post._id),
      image: this.$metatags.shareImage(this.post._id)
    }
  },
  computed: {
    post() {
      return this.$store.val("post") || {}
    }
  },
  methods: {}
}
</script>

<style lang="less">
.news-single-entry {
  background: var(--color-bg-alt);
  overflow: hidden;

  .featured-image-wrap,
  .entry-meta,
  .post-entry,
  .author-card {
    padding: 1em 2em;
  }

  .entry-meta {
    justify-content: normal;
  }

  @media (max-width: 900px) {
    .return-link,
    .entry-meta,
    .author-card {
      padding: 1em;
    }
  }
}
</style>

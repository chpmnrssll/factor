<template>
  <div class="single-entry">
    <component
      :is="$setting.get(`jobs.components.${comp}`)"
      v-for="(comp, i) in $setting.get('jobs.layout.single')"
      :key="i"
      :post-id="post._id"
    />
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
.single-entry {
  .widget-date,
  .entry-meta,
  .post-entry,
  .social-share {
    max-width: 50rem;
    margin: 1rem auto;
    padding: 0;
  }

  @media (max-width: 767px) {
    .return-link,
    .entry-headers,
    .post-entry,
    .entry-meta,
    .social-share {
      padding: 0 1em;
    }
  }
}
</style>
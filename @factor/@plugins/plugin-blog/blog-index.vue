<template>
  <div class="entries">
    <component :is="$setting.get('blog.components.returnLink')" v-if="tag || page > 1" />
    <div v-if="loading" class="posts-loading">
      <factor-loading-ring />
    </div>
    <div v-else-if="blogPosts.length > 0" class="post-index">
      <div v-for="(post) in blogPosts" :key="post._id" class="post">
        <component
          :is="$setting.get(`blog.components.${comp}`)"
          v-for="(comp, i) in $setting.get('blog.layout.index')"
          :key="i"
          :post-id="post._id"
        />
      </div>
    </div>
    <div v-else class="posts-not-found">
      <div class="text">
        <div class="title">{{ $setting.get("blog.notFound.title") }}</div>
        <div class="sub-title">{{ $setting.get("blog.notFound.subTitle") }}</div>
      </div>
    </div>
    <component :is="$setting.get('blog.components.pagination')" :post-type="postType" />
  </div>
</template>
<script>
export default {
  data() {
    return {
      postType: "blog",
      loading: false
    }
  },
  metatags() {
    const title = this.tag
      ? `Tag "${this.tag}"`
      : this.$setting.get("blog.metatags.index.title")

    const description = this.tag
      ? `Articles related to tag: ${this.tag}`
      : this.$setting.get("blog.metatags.index.description")

    return {
      title,
      description
    }
  },
  serverPrefetch() {
    return this.getPosts()
  },
  computed: {
    tag() {
      return this.$route.params.tag || this.$route.query.tag || ""
    },
    index() {
      return this.$store.val(this.postType) || {}
    },
    blogPosts() {
      const { posts = [] } = this.index
      return posts
    },
    page() {
      return this.$route.query.page || 1
    }
  },
  watch: {
    $route: {
      handler: function(to) {
        this.getPosts()
      }
    }
  },
  mounted() {
    this.getPosts()
  },
  methods: {
    async getPosts() {
      this.loading = true

      const r = await this.$post.getPostIndex({
        postType: this.postType,
        tag: this.tag,
        status: "published",
        sort: "-date",
        page: this.page,
        limit: this.$setting.get("blog.limit")
      })

      this.loading = false
    }
  }
}
</script>

<style lang="less">
.posts-not-found,
.posts-loading {
  min-height: 50vh;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  .title {
    font-size: 1.4em;
    font-weight: var(--font-weight-bold);
  }
}
.post-index {
  .post {
    margin: 4rem 0;
    &:first-child {
      margin-top: 0;
    }
  }
}
</style>
<template>
  <div class="jobs-entries">
    <component :is="$setting.get('jobs.components.returnLink')" v-if="page > 1" />
    <div v-if="loading" class="jobs-posts-loading">
      <factor-loading-ring />
    </div>
    <div v-else-if="jobsPosts.length > 0" class="jobs-post-index">
      <div v-for="(post) in jobsPosts" :key="post._id" class="jobs-post">
        <div>
          <img
            :src="getPost(post.jobIcon).url || require(`./img/icon-default.svg`)"
            class="jobs-post-icon"
          />
        </div>
        <div>
          <component
            :is="$setting.get(`jobs.components.${comp}`)"
            v-for="(comp, i) in $setting.get('jobs.layout.index')"
            :key="i"
            :post-id="post._id"
          />
        </div>
      </div>
    </div>
    <div v-else class="job-posts-not-found">
      <div class="text">
        <div class="title">{{ $setting.get("jobs.notFound.title") }}</div>
        <div class="sub-title">{{ $setting.get("jobs.notFound.subTitle") }}</div>
      </div>
    </div>
    <component :is="$setting.get('jobs.components.pagination')" :post-type="postType" />
  </div>
</template>
<script>
export default {
  data() {
    return {
      postType: "jobs",
      loading: false
    }
  },
  metatags() {
    const title = this.tag
      ? `Tag "${this.tag}"`
      : this.$setting.get("jobs.metatags.index.title")

    const description = this.tag
      ? `Articles related to tag: ${this.tag}`
      : this.$setting.get("jobs.metatags.index.description")

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
    jobsPosts() {
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
    getPost(_id) {
      return this.$store.val(_id) || {}
    },
    async getPosts() {
      this.loading = true

      const r = await this.$post.getPostIndex({
        postType: this.postType,
        tag: this.tag,
        status: "published",
        sort: "-date",
        page: this.page,
        limit: this.$setting.get("jobs.limit")
      })

      this.loading = false
    }
  }
}
</script>

<style lang="less">
.jobs-posts-not-found,
.jobs-posts-loading {
  min-height: 50vh;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  .title {
    font-size: 1.4em;
    font-weight: var(--font-weight-bold, 800);
  }
}
.jobs-entries {
  .jobs-post-index {
    padding: 1em 2em;
    box-shadow: 0 0 1px rgba(58, 55, 148, 0.25), 0 6px 14px 0 rgba(24, 32, 41, 0.06),
      0 12px 34px 0 rgba(24, 32, 41, 0.04);
    background: #fff;
    .jobs-post {
      display: grid;
      grid-template-columns: 80px 1fr;
      border-bottom: 1px solid rgba(80, 102, 119, 0.1);
      padding-bottom: 2em;
      margin-top: 2em;
      @media (max-width: 767px) {
        grid-template-columns: 1fr;
      }
      &:last-child {
        margin-bottom: 0;
        border-bottom: none;
      }
      .jobs-post-icon {
        width: 30px;
        height: auto;
      }
      p {
        font-size: 1.2em;
        font-weight: var(--font-weight-normal, 400);
        line-height: 1.6em;
        margin-bottom: 1em;
        opacity: 0.7;
        @media (max-width: 767px) {
          clear: both;
        }
      }
    }
  }
}
</style>
<template>
  <section class="back-to-top">
    <div class="mast">
      <factor-btn btn="link" size="normal" @click="scrollToTop">
        Back to Top
        <factor-icon icon="arrow-up" />
      </factor-btn>
    </div>
  </section>
</template>
<script>
export default {
  mounted() {},
  methods: {
    scrollToTop() {
      window.scrollTo(0, 0)
    }
  }
}
</script>
<style lang="less">
.back-to-top {
  padding-top: 3em;
  text-align: right;
  @media (max-width: 767px) {
    text-align: center;
  }
  .factor-btn {
    color: inherit;
    margin-bottom: 20px;
    i {
      transition: transform 0.15s ease;
    }
    &:hover {
      color: inherit;
      transform: none;
      i {
        transform: translateY(-5px);
      }
    }
  }
}
</style>

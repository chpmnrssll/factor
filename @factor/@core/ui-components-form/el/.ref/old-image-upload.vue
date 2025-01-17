<template>
  <div class="image-upload-container">
    <div class="image-upload-input">
      <div ref="organizer" class="image-organizer">
        <div
          v-for="(img, index) in populated"
          :id="img._id"
          :key="img._id"
          :class="max <= 1 ? 'no-sort-img' : 'sort-img'"
          class="image-item image-uploaded"
        >
          <div class="image-item-pad">
            <div
              :style="styleImageBG(img)"
              :class="img.status || 'no-status'"
              class="image-item-content"
            >
              <div class="status-bar">
                <div
                  v-if="img.status == 'progress' || img.status === 'preprocess'"
                  class="image-status overlay"
                  :class="img.status"
                >
                  <div :style="{width: `${img.progress}%`}" class="bar" />
                </div>

                <factor-menu
                  v-else
                  :item-key="index"
                  class="menu"
                  :list="['view', 'copy-URL', 'delete']"
                  @action="action($event)"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="max == 1 || images.length < max"
          ref="multiImageDrop"
          class="image-item ignore-sortable image-drop"
        >
          <div class="image-item-pad">
            <div class="image-item-content">
              <input
                ref="multiImageInput"
                class="input-upload"
                type="file"
                accept="image/*"
                multiple
                @change="handleMultiUpload($event)"
              />
              <factor-loading-ring v-if="loading" width="2em" />
              <div v-else class="upload-status">
                <div class="wrp">
                  <factor-icon icon="arrow-up" />
                  <span>Add</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <input ref="copyInput" v-model="copyText" type="text" class="invisible-copy" />
    <factor-lightbox :visible.sync="lightboxShow" :imgs="images" :index="lightboxIndex" />
  </div>
</template>
<script>
import Sortable from "sortablejs";
export default {
  props: {
    loading: { type: Boolean, default: false },
    value: { type: Array, default: () => [] },
    customValidity: { type: String, default: "" },
    watermark: { type: Boolean, default: false }
  },
  data() {
    return {
      imageIds: [],
      images: [],
      imageMeta: {},
      lightboxShow: false,
      lightboxIndex: 0,
      callback: null,
      copyText: ""
    };
  },
  computed: {
    max() {
      return this.$attrs["input-max"] ? parseInt(this.$attrs["input-max"]) : 10;
    },
    min() {
      return typeof this.$attrs["input-min"] != "undefined"
        ? parseInt(this.$attrs["input-min"])
        : typeof this.$attrs["required"] != "undefined"
        ? 1
        : 0;
    },
    isRequired() {
      return typeof this.$attrs["required"] != "undefined" ? true : false;
    },
    populated() {
      return this.value.map(_ => this.$store.val(_));
    }
  },

  mounted() {
    this.$events.$on("uploadImage", ({ selector, callback }) => {
      if (selector == this.selector) {
        this.callback = callback;
        this.$refs.multiImageInput.click();
      }
    });

    this.$watch(
      `value`,
      function(v) {
        if (v && Array.isArray(v) && v.length > 0) {
          this.imageIds = v;
        }
        //this.setImages(v)
        this.setValidity();
      },
      { deep: true, immediate: true }
    );

    this.dom();
  },
  methods: {
    action({ key, value }) {
      const image = this.images[key];
      if (value == "view") {
        this.lightboxShow = true;
        this.lightboxIndex = key;
      } else if (value == "copy-URL") {
        this.copyUrl(key);
      } else if (value == "delete") {
        this.removeImage(key);
      }
    },
    doCallback(img) {
      if (this.callback && typeof this.callback == "function") {
        this.callback(img);
        this.callback = null;
      }
    },
    copyUrl(key) {
      const image = this.images[key];
      this.copyText = image.url.includes("base64")
        ? `[IMAGEID:${image._id}]`
        : image.url;
      this.$nextTick(() => {
        this.$refs.copyInput.select();

        document.execCommand("copy");

        this.$events.$emit("notify", "Url Copied");
      });
    },
    styleImageBG(img) {
      const { url } = img;

      return url ? { backgroundImage: `url(${url})` } : {};
    },
    setValidity() {
      let validity = "";

      if (this.images.length < this.min) {
        validity = `Please upload at least ${this.min} images.`;
      } else if (this.images.length > this.max) {
        validity = `Please submit maximum ${this.max} images.`;
      }

      this.$emit("update:customValidity", validity);
    },
    dom() {
      const jq = this.$jquery(this.$el);
      const dropEl = jq.find(".image-drop");
      this.imgInput = jq.find(`.input-upload`);

      dropEl.on("dragenter", e => {
        dropEl.addClass("dragover");
      });
      dropEl.on("dragleave", e => {
        dropEl.removeClass("dragover");
      });
      dropEl.on("drop", e => {
        dropEl.removeClass("dragover");
      });

      jq.on("dragover", e => {
        e.stopPropagation();
        e.preventDefault();
      });
      jq.on("drop", e => {
        e.stopPropagation();
        e.preventDefault();
        dropEl.removeClass("dragover");

        this.handleMultiImage(e.originalEvent.dataTransfer.files);
      });

      if (this.max > 1) {
        Sortable.create(this.$refs.organizer, {
          filter: ".ignore-sortable",
          ghostClass: "sortable-ghost",
          onUpdate: e => {
            if (this.imageIds[e.oldIndex]) {
              const moved = this.imageIds.splice(e.oldIndex, 1);
              this.imageIds.splice(e.newIndex, 0, moved[0]);

              this.updateValue();
            }
          },
          onMove: e => {
            if (this.$jquery(e.related).hasClass("ignore-sortable")) {
              return false;
            }
          }
        });
      }
    },

    setImages(v) {
      if (this.images.length == 0 && Array.isArray(v) && v.length > 0) {
        this.images = v.filter(_ => _ && _.url);
      }
    },
    updateValue() {
      this.$emit("input", this.images);

      this.$emit("update:customValidity", this.validity);

      // Delay autosave to make sure all models are correct
      // setTimeout(() => {
      //   this.$emit("autosave", this.images)
      // }, 100)
    },

    removeImage(index) {
      const image = this.images[index];
      // If no path provided, we can't delete
      if (image.path) {
        this.$storage.delete({ path: image.path });
      }

      this.$delete(this.images, index);
      this.updateValue();
    },

    handleMultiUpload(e) {
      this.handleMultiImage(e.target.files);
    },

    async handleMultiImage(files) {
      this.numFiles = 0;
      if (files[0] && this.max == 1 && this.images.length >= 1) {
        this.removeImage(0);
      }

      for (let file of files) {
        if (this.images.length < this.max) {
          const meta = {
            status: "preprocess"
          };

          let index = this.images.push(meta) - 1;

          this.numFiles++;
          this.uploadFile({
            meta,
            file,
            index
          });
        }
      }
    },

    uploadFile({ meta, file, index, path }) {
      this.uploadedFiles = 0;
      const item = this.images[index];

      this.$emit("upload", { file, index, path, item });

      this.$storage.upload({
        file,
        onPrep: ({ mode, percent, preview = false }) => {
          this.$set(item, "url", preview);
          this.$set(item, "status", "preprocess");
        },
        onChange: progressEvent => {
          const { loaded, total } = progressEvent;

          this.$set(item, "status", "progress");
          this.$set(item, "progress", (loaded / total) * 100);
        },
        onError: error => {
          this.$set(item, "status", "error");
          this.$set(item, "message", error.message);
        },
        onFinished: ({ url, _id }) => {
          console.log("ON FINISHED", url, _id);
          // preload
          var img = new Image();
          img.src = url;
          this.$set(item, "url", url);
          this.$set(item, "_id", _id);
          this.$set(item, "status", "complete");
          this.uploadedFiles++;

          this.doCallback(item);

          // Only update value once all images uploaded (multi)
          if (this.uploadedFiles >= this.numFiles) {
            setTimeout(() => {
              this.updateValue();
            }, 500);
          }
        }
      });
    }
  }
};
</script>

<style lang="less">
.image-upload-input {
  .validity {
    position: absolute;
    height: 0;
    width: 0;
    left: 50%;
  }

  flex-basis: 100%;
  max-width: 100%;
  position: relative;
  .image-organizer {
    display: grid;

    grid-template-columns: repeat(auto-fit, minmax(50px, 80px));
    grid-gap: 10px;
    &.hidden {
      display: none;
    }

    transition: opacity 0.5s;
  }
}
.image-item {
  position: relative;

  display: block;
  &.sort-img {
    cursor: grab;
  }

  .image-item-pad {
    width: 100%;
    height: 100%;
  }
}
.image-upload-container {
  .invisible-copy {
    position: absolute;
    left: -9999px;
  }
}
.image-upload-container {
  .image-status {
    line-height: 1.2;
    text-align: center;
    position: relative;
    padding: 2px;

    line-height: 1;
    border-radius: 5px;
    opacity: 1;
    color: #fff;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    &.overlay {
      background: rgba(0, 0, 0, 0.4);
      position: absolute;
      top: 10%;
      left: 10%;
      width: 80%;
      height: 8px;
    }
    &.success {
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
      color: #fff;
    }
    .bar {
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(255, 255, 255, 1);
      width: 0%;
      height: 100%;
      border-radius: 8px;
      transition: width 0.8s;
      transition: all 0.2s;
    }
  }
  .menu {
    height: 100%;
    width: 100%;
    .toggle-btn {
      opacity: 0;
      height: 100%;
    }
  }
}
.image-item-content {
  .loading-ring-wrap {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
  }
  //box-shadow: inset @factor-input-shadow;
  transition: 0.1s all;
  border-radius: 6px;
  width: 100%;
  padding: 50% 0;
  // height: 100%;
  position: relative;
  background-size: cover;
  background-position: 50%;

  display: flex;
  //background-color: @factor-input-bg;
  .status-bar {
    top: 0;
    position: absolute;
    width: 100%;
    height: 100%;
    text-align: center;
  }
  &.preprocess {
    background-color: var(--factor-color-text);
  }

  &.dragover,
  &:hover {
    cursor: move;
  }
}
.image-drop .image-item-content {
  text-align: center;
  position: relative;

  border-radius: 6px;

  .upload-icon {
    border-radius: 50%;

    width: 1.5em;
    height: 1.5em;
    line-height: 1.5em;
    font-size: 1.5em;
    display: inline-block;
  }
  .upload-status {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    position: absolute;
    height: 100%;
    top: 0;
  }

  &:active,
  &:focus {
    opacity: 1;
  }
  .input-upload,
  .input-upload::-webkit-file-upload-button {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1000;
  }
}
</style>

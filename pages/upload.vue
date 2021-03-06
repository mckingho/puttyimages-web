<template>
  <div class="page-container page-container--fluid">
    <div :class="['upload-image-page', { 'upload-image-page--full-size': isShowUploadImageForm }]">
      <input
        ref="imageInput"
        :accept="acceptInput"
        style="display: none"
        type="file"
        @change="onImageInputChange"
      >

      <v-snackbar
        v-model="isInvalidImage"
        :auto-height="true"
        :bottom="true"
        :timeout="0"
        class="snackbar--likecoin"
        color="green"
      >
        {{ invalidImageDescription }}
        <v-btn
          fab
          flat
          @click.native="closeInvalidImageError"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-snackbar>

      <section
        v-if="!image && !isImageLoading"
        class="upload-image-page__upload-image-section"
      >
        <v-btn
          class="btn--likecoin"
          color="secondary"
          @click="onClickChooseFile"
        >
          {{ $t('Upload.button.chooseFile') }}
        </v-btn>
        <span class="upload-image-page__upload-image-section__supported-type-label">
          {{ $t('Upload.label.supportedTypes', { types: supportedFileTypes }) }}
        </span>
      </section>

      <section
        v-else
        class="upload-image-page__image-preview-section"
      >
        <div
          :style="{ 'background-image': `url('${image}')` }"
          class="upload-image-page__image-preview-section__preview-image"
        >
          <v-progress-circular
            v-if="isImageLoading"
            :width="2"
            color="indigo darken-2"
            size="48"
            indeterminate
          />
        </div>
        <div
          v-if="!isShowUploadImageForm"
          class="upload-image-page__image-preview-section__preview-image-button-group"
        >
          <v-btn
            :disabled="isImageLoading"
            class="btn--likecoin upload-image-page__image-preview-section__next-button"
            color="primary"
            @click="onClickNext"
          >
            {{ $t('General.button.next') }}
          </v-btn>
          <v-btn
            :disabled="isImageLoading"
            class="btn--likecoin"
            color="primary"
            flat
            @click="onClickChooseFile"
          >
            <span class="text--size-16">
              {{ $t('Upload.button.chooseAnotherFile') }}
            </span>
          </v-btn>
        </div>
      </section>

      <transition name="upload-image-page__upload-image-form-section">
        <section
          v-if="isShowUploadImageForm"
          class="upload-image-page__upload-image-form-section"
        >
          <div class="upload-image-page__upload-image-form-section__overlay" />
          <v-snackbar
            v-model="isShowUploadImageForm"
            :auto-height="true"
            :timeout="0"
            :top="true"
            class="snackbar--likecoin center"
            color="warning"
          >
            {{ $t('Upload.label.uploadWarning') }}
          </v-snackbar>

          <div>
            <v-btn
              class="upload-image-page__upload-image-form-section__back-button"
              flat
              @click="isShowUploadImageForm = false"
            >
              <v-icon
                dark
                size="48"
              >
                arrow_back
              </v-icon>
              {{ $t('General.button.back') }}
            </v-btn>

            <the-image-upload-form
              :exif="imageExif"
              :file="imageFile"
              @upload="onUpload"
            />
          </div>

        </section>
      </transition>

    </div>
  </div>
</template>

<script>
import ExifParser from 'exif-parser';

import TheImageUploadForm from '@/components/TheImageUploadForm';

import {
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_MB,
  SUPPORTED_IMAGE_TYPE,
} from '@/constant';

const SUPPORTED_FILE_TYPES = [...SUPPORTED_IMAGE_TYPE];

export default {
  components: {
    TheImageUploadForm,
  },
  data() {
    return {
      image: null,
      imageExif: {},
      imageFile: null,
      isExceedMaxSize: false,
      isImageLoading: false,
      isShowUploadImageForm: false,
      acceptInput: SUPPORTED_FILE_TYPES.join(', '),
      supportedFileTypes: SUPPORTED_FILE_TYPES.reduce(
        (acc, current) => `${acc}, ${current}`
      ),
    };
  },
  computed: {
    isInvalidImage() {
      return this.isExceedMaxSize;
    },
    invalidImageDescription() {
      if (this.isExceedMaxSize) {
        return this.$t('Upload.error.fileTooLarge', {
          size: MAX_IMAGE_SIZE_MB,
        });
      }
      return null;
    },
  },
  head() {
    return {
      title: 'Upload image - Puttyimages',
    };
  },
  methods: {
    onClickChooseFile() {
      this.$refs.imageInput.click();
    },
    onImageInputChange({ target }) {
      if (target.value.length === 0) {
        return;
      }

      const { files } = target;

      if (files && files[0]) {
        const [file] = Object.values(files);

        if (file.size > MAX_IMAGE_SIZE) {
          this.isExceedMaxSize = true;
          return;
        }

        this.image = null;
        this.isImageLoading = true;
        const dataUrlReader = new FileReader();
        const arrayBufferReader = new FileReader();

        dataUrlReader.onload = (e) => {
          this.closeInvalidImageError();

          const img = new Image();
          img.onload = () => {
            this.image = URL.createObjectURL(file);
            this.imageFile = file;
            this.isImageLoading = false;
          };
          img.src = e.target.result;
        };
        dataUrlReader.readAsDataURL(files[0]);

        arrayBufferReader.onload = (e) => {
          const parser = ExifParser.create(e.target.result);
          this.imageExif = parser.parse();
        };
        arrayBufferReader.readAsArrayBuffer(files[0]);
      }
    },
    onClickNext() {
      this.closeInvalidImageError();
      this.isShowUploadImageForm = true;
    },
    onUpload(asset) {
      this.$router.push({
        name: 'assets-id',
        params: { id: asset.fingerprint },
      });
    },
    closeInvalidImageError() {
      this.isExceedMaxSize = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~assets/css/classes';

.page-container {
  @include mobile-only {
    padding-right: 0 !important;
    padding-left: 0 !important;
  }
}

.upload-image-page {
  position: relative;

  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;

  min-height: calc(100vh - 240px);

  background-color: #f7f7f7;

  @include mobile-only {
    width: 100%;
    height: 100%;
  }

  &:not(.upload-image-page--full-size) {
    height: calc(100vh - 240px);
  }

  // Upload image section
  &__upload-image-section {
    display: flex;
    flex-direction: column;

    text-align: center;

    @extend .px-24;

    &__supported-type-label {
      color: #4a4a4a;

      @extend .mt-16;
    }

    .btn--likecoin {
      @extend .ma-0;
    }
  }

  // Image preview section
  &__image-preview-section {
    display: flex;
    flex-direction: column;

    width: 100%;
    height: 100%;

    @extend .py-16, .px-64, .pa-0--xs;

    &__preview-image {
      display: flex;
      align-items: center;
      flex: 1;
      justify-content: center;

      transition: transform 0.5s cubic-bezier(0.2, 0.2, 0, 1);

      background-position: center;
      background-size: contain;

      @extend .mx-32--xs, .my-16--xs;

      .upload-image-page--full-size & {
        transform: scale(1.1);

        background-attachment: fixed;
        background-size: cover;

        @extend .ma-0;
      }
    }

    .upload-image-page--full-size & {
      position: absolute;

      @extend .pa-0;
    }

    &__preview-image-button-group {
      display: flex;
      align-items: center;
      flex-direction: column;

      @extend .pt-24;
    }

    &__next-button {
      width: 100%;

      @include tablet-and-up {
        max-width: 50vw;
      }
    }
  }

  // Image form section
  &__upload-image-form-section {
    width: 100%;
    height: 100%;

    @extend .pt-48--xs;

    &__overlay {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;

      background-color: rgba(0, 0, 0, 0.57);
    }

    .snack {
      @include tablet-and-up {
        top: 48px;
      }
      @include mobile-only {
        position: absolute;
      }
    }

    &__back-button {
      position: absolute;
      top: 24px;

      cursor: pointer;

      @extend .text--color-white, .text--size-24, .text--weight-400;
      @include mobile-only {
        margin-top: 84px;
      }
    }
  }
}

.upload-image-page__upload-image-form-section- {
  &enter-active {
    transition: (
      margin 0.5s cubic-bezier(0.2, 0.2, 0, 1),
      opacity 0.5s cubic-bezier(0.2, 0.2, 0, 1)
    );
  }
  &enter {
    margin-top: -24px;

    opacity: 0;
  }
}
</style>

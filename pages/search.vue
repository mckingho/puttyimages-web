<template>
  <div class="search-page">
    <div class="page-container page-container--fluid">
      <div class="search-page__field">
        <search-icon class="search-page__icon" />
        <v-text-field
          ref="searchField"
          v-model="searchQuery"
          :loading="isLoading"
          :placeholder="$t('Search.label.searchAnyImage')"
          class="search-page__input"
          color="brown"
          hide-details
          @keyup.native="onKeywordChange"
        />
      </div>
    </div>

    <div class="page-container page-container--wide">
      <div class="mt-48">
        <masonry-images-grid
          :colCount.sync="colCount"
          :images="masonryImages"
        />

        <no-ssr>
          <infinite-loading
            v-if="searchQuery.length"
            ref="infiniteLoading"
            spinner="spiral"
            @infinite="infiniteHandler"
          >
            <span slot="no-more" />
            <div
              slot="no-results"
              class="search-page__no-results"
            >
              <p>{{ $t('Search.label.placeholder', { searchQuery } ) }}</p>
              <img
                :src="noResultsImage"
                class="mt-40"
              >
            </div>
          </infinite-loading>
        </no-ssr>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import InfiniteLoading from 'vue-infinite-loading';

import noResultsImage from '@/assets/img/no-results.png';

import axios from '@/plugins/axios';

import MasonryImagesGrid, {
  mixin as masonryImagesGridMixin,
} from '~/components/MasonryImagesGrid';
import SearchIcon from '~/assets/icons/search.svg';

import ipldMixin from '~/util/mixins/ipld';

export default {
  components: {
    InfiniteLoading,
    MasonryImagesGrid,
    SearchIcon,
  },
  mixins: [masonryImagesGridMixin, ipldMixin],
  data() {
    const { q, tags } = this.$route.query;

    let searchQuery = '';
    if (tags) {
      searchQuery = tags
        .split(',')
        .reduce((tagQuery, tag) => `${tagQuery}#${tag} `, '')
        .trim();
    } else if (q) {
      searchQuery = decodeURIComponent(q);
    }

    return {
      images: [],
      isLoading: false,
      noResultsImage,
      pageInfo: null,
      rawImages: [],
      searchQuery,
      timer: null,
    };
  },
  computed: {
    ...mapGetters(['getFeaturedImages']),
    featuredImages() {
      return this.sortImagesByHeight(this.getFeaturedImages, this.colCount);
    },
    imagesWithIpld() {
      return this.images.map((image, i) => ({
        ...image,
        ...this.iplds[i],
      }));
    },
    masonryImages() {
      if (this.imagesWithIpld.length > 0 || this.searchQuery.length > 0) {
        return this.imagesWithIpld;
      }
      return this.featuredImages;
    },
  },
  head() {
    return {
      title: `${
        this.searchQuery ? `${this.searchQuery} - ` : ''
      }Search Images | puttyimages`,
    };
  },
  watch: {
    images(list) {
      this.fetchIplds(list.map(({ ipld }) => ipld));
    },
  },
  mounted() {
    this.onKeywordChange();
    if (!this.searchQuery) {
      this.$refs.searchField.focus();
    }
  },
  methods: {
    ...mapActions(['fetchFeaturedImages']),
    async infiniteHandler($state) {
      const { colCount, pageInfo, rawImages } = this;
      if (pageInfo && pageInfo.hasNextPage) {
        try {
          this.isLoading = true;
          const { data, pageInfo: nextPageInfo } = (await axios.get(
            pageInfo.next
          )).data;
          this.isLoading = false;
          this.rawImages = rawImages.concat(data);
          this.images = this.sortImagesByHeight(this.rawImages, colCount);
          this.pageInfo = nextPageInfo;
          $state.loaded();
          this.checkIsSearchCompleted();
        } catch (err) {
          this.isLoading = false;
        }
      }
    },
    matchRouteToSearchQuery() {
      const nextRoute = {
        name: 'search',
        query: {},
      };

      if (this.searchQuery) {
        nextRoute.query.q = this.searchQuery;
      }

      // Replace route history if:
      // - there is no 'q' field in query string or;
      // - there are more than one fields
      if (!this.$route.query.q || Object.keys(this.$route.query).length > 1) {
        this.$router.replace(nextRoute);
      } else {
        this.$router.push(nextRoute);
      }
    },
    async onKeywordChange(e) {
      const { colCount, getFeaturedImages, searchQuery } = this;
      if (searchQuery.length === 0) {
        if (getFeaturedImages.length === 0) {
          this.fetchFeaturedImages();
        }
        this.isLoading = false;
        this.images = [];
        this.pageInfo = null;
        this.matchRouteToSearchQuery();
        return;
      } else if (e) {
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.onKeywordChange(), 300);
        return;
      }

      this.isLoading = true;
      try {
        const { data, pageInfo } = (await axios.get(
          `/api/search?q=${encodeURIComponent(searchQuery)}`
        )).data;
        this.rawImages = data;
        this.images = this.sortImagesByHeight(data, colCount);
        this.pageInfo = pageInfo;

        const { stateChanger } = this.$refs.infiniteLoading;
        stateChanger.reset();
        if (data.length) {
          stateChanger.loaded();
        }
        this.matchRouteToSearchQuery();

        this.isLoading = false;
        this.checkIsSearchCompleted();
      } catch (err) {
        this.isLoading = false;
      }
    },
    checkIsSearchCompleted() {
      if (this.pageInfo && !this.pageInfo.hasNextPage) {
        this.$refs.infiniteLoading.stateChanger.complete();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~assets/css/classes';

.application .search-page__input /deep/ .input-group__details:before {
  background-color: transparent;
}

.search-page {
  @extend .pb-32;

  .page-container {
    @extend .px-0--xs;
  }
}

.search-page__field {
  display: flex;
  align-items: center;

  margin: 0 auto;

  border-radius: 2px;
  background: #efefef;

  @extend .px-16, .mx-12--xs;
  @include desktop-and-up {
    width: 60%;
  }
}

.search-page__icon {
  width: 23px;
  height: 23px;

  color: #aaa;
}

.search-page__input {
  margin-left: 14px;
  padding: 14px 0;
}

.search-page__input /deep/ input::placeholder {
  text-align: center;
}

.search-page__no-results {
  color: color(gray-4a);

  @extend .text--size-18, .py-48;

  img {
    width: 248px;
    height: 176px;
  }
}
</style>

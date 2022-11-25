<template>
  <div>
    <b-navbar toggleable="xl" type="dark" variant="primary" id="main-navigation">
      <button v-b-toggle.sidebar variant="outline-light" id="dataset-selector" class="mr-3 navbar-toggler collapsed"><span class="navbar-toggler-icon" /></button>
      <b-navbar-brand :to="{ name: 'home' }" class="d-flex align-items-center">
        <b-img src="img/stash.svg" height="40px" class="d-inline-block align-top mr-3" alt="Stash" />
        <b-img src="img/stash-text.svg" height="20px" class="d-inline-block align-top" alt="Stash text logo" />
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <template #button-content>
              <BIconFlag /><span> {{ $t('menuLocale') }}</span>
            </template>
            <b-dropdown-item v-for="language in languages" :key="`locale-${language.locale}`" @click="onLocaleChanged(language)">
              <span class="mr-2">{{ language.icon }}</span>
              <span>{{ language.name }}</span>
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <!-- The main content -->
    <b-container class="mt-4">
      <router-view :key="$route.path" />
    </b-container>

    <b-modal ref="loadingModal" :title="$t('modalTitleLoading')" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
        <p class="text-muted mt-3" v-if="$t('modalTextLoading')">{{ $t('modalTextLoading') }}</p>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { BIconFlag } from 'bootstrap-vue'
import { loadLanguageAsync } from '@/plugins/i18n'
import { apiPostToken } from '@/plugins/api/auth'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconFlag
  },
  computed: {
    ...mapGetters([
      'storeLocale'
    ])
  },
  data: function () {
    return {
      languages: [{
        locale: 'en_GB',
        name: 'British English',
        icon: '🇬🇧'
      }, {
        locale: 'de_DE',
        name: 'Deutsch - Deutschland',
        icon: '🇩🇪'
      }]
    }
  },
  methods: {
    /**
     * When the locale is changed, update the i18n settings
     * @param language The newly selected locale
     */
    onLocaleChanged: function (language) {
      loadLanguageAsync(language.locale).then(() => {
        this.$i18n.locale = language.locale
        this.$store.dispatch('setLocale', language.locale)

        this.plausibleEvent('locale-change', { locale: language.locale })
      })
    },
    toggleLoading: function (show) {
      if (show) {
        this.$refs.loadingModal.show()
      } else {
        this.$refs.loadingModal.hide()
      }
    }
  },
  mounted: function () {
    loadLanguageAsync(this.storeLocale)

    emitter.on('show-loading', this.toggleLoading)

    // TODO
    apiPostToken({
      username: '',
      password: ''
    }, result => {
      // Do this here as well
      this.$store.commit('ON_TOKEN_CHANGED', result)

      // Otherwise, just go to home
      this.$router.push({ name: 'home' })
    })
  },
  beforeDestroy: function () {
    emitter.off('show-loading', this.toggleLoading)
  }
}

</script>

<style lang="scss">
$primary: #1289A7;
$secondary: #006266;

@import '~bootswatch/dist/pulse/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/pulse/bootswatch';
</style>
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
        <b-navbar-nav v-if="storeToken && storeToken.token">
          <b-nav-item @click="setSearchVisible()"><BIconSearch /> {{ $t('menuSearch') }}</b-nav-item>
          <b-nav-item :to="{ name: 'predefine' }"><BIconUiChecks /> {{ $t('menuPredefine') }}</b-nav-item>
          <b-nav-item :to="{ name: 'import' }"><BIconBoxArrowInDownRight /> {{ $t('menuImport') }}</b-nav-item>
          <b-nav-item :to="{ name: 'transfer' }"><BIconArrowLeftRight /> {{ $t('menuTransfer') }}</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-item @click="toggleAudioFeedback"><BIconVolumeUp v-if="storeAudioFeedbackEnabled" /><BIconVolumeMute v-else /></b-nav-item>
          <b-nav-item-dropdown right>
            <template #button-content>
              <BIconFlag /><span> {{ $t('menuLocale') }}</span>
            </template>
            <b-dropdown-item v-for="language in languages" :key="`locale-${language.locale}`" @click="onLocaleChanged(language)">
              <span class="mr-2">{{ language.icon }}</span>
              <span>{{ language.name }}</span>
            </b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown right v-if="storeToken && storeToken.token">
             <template #button-content>
              <b-avatar :src="userIcon" :size="25" v-if="userIcon" />
             </template>
             <template v-if="userIsAdmin">
              <b-dropdown-item :to="{ name: 'user' }"><BIconPeople /> {{ $t('dropdownUsers') }}</b-dropdown-item>
              <b-dropdown-divider />
             </template>
             <b-dropdown-item @click="logout"><BIconBoxArrowRight /> {{ $t('dropdownSignOut') }}</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <b-collapse v-model="searchVisible" class="bg-primary" v-if="storeToken && storeToken.token">
      <ContainerSearch label="formLabelSearch" :description="null" :tabIndex="1" autofocus @container-selected="() => {}" class="p-3" v-if="searchVisible" />
    </b-collapse>

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
import ContainerSearch from '@/components/ContainerSearch'

import { mapGetters } from 'vuex'
import { BIconFlag, BIconVolumeUp, BIconVolumeMute, BIconBoxArrowRight, BIconSearch, BIconUiChecks, BIconBoxArrowInDownRight, BIconArrowLeftRight, BIconPeople } from 'bootstrap-vue'
import { loadLanguageAsync } from '@/plugins/i18n'
import { apiCheckToken, apiDeleteToken, userIsAtLeast } from './plugins/api/auth'

const emitter = require('tiny-emitter/instance')

let textSynth

export default {
  components: {
    BIconFlag,
    BIconVolumeUp,
    BIconVolumeMute,
    BIconBoxArrowRight,
    BIconSearch,
    BIconUiChecks,
    BIconBoxArrowInDownRight,
    BIconArrowLeftRight,
    BIconPeople,
    ContainerSearch
  },
  computed: {
    ...mapGetters([
      'storeLocale',
      'storeAudioFeedbackEnabled',
      'storeToken',
      'storeServerUrl'
    ]),
    userIsAdmin: function () {
      if (this.storeToken && this.storeToken.userType && userIsAtLeast(this.storeToken.userType, 'admin')) {
        return true
      } else {
        return false
      }
    },
    userIcon: function () {
      if (this.storeToken && this.storeToken.id && this.storeToken.imageToken) {
        return `${this.storeServerUrl}user/${this.storeToken.id}/img?imageToken=${this.storeToken.imageToken}`
      } else {
        return null
      }
    }
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
      }],
      searchVisible: false,
      searchTerm: null
    }
  },
  methods: {
    toggleAudioFeedback: function () {
      this.$store.dispatch('setAudioFeedbackEnabled', !this.storeAudioFeedbackEnabled)
    },
    /**
     * When the locale is changed, update the i18n settings
     * @param language The newly selected locale
     */
    onLocaleChanged: function (language) {
      loadLanguageAsync(language.locale).then(() => {
        this.$i18n.locale = language.locale
        this.$store.dispatch('setLocale', language.locale)
      })
    },
    toggleLoading: function (show) {
      if (show) {
        this.$refs.loadingModal.show()
      } else {
        this.$refs.loadingModal.hide()
      }
    },
    speak: function (text, interruptPrev = true) {
      if (textSynth && this.storeAudioFeedbackEnabled) {
        if (interruptPrev) {
          textSynth.cancel()
        }

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.2
        textSynth.speak(utterance)
      }
    },
    toast: function (config) {
      this.$bvToast.toast(config.message, {
        title: config.title,
        autoHideDelay: 5000,
        appendToast: true,
        variant: config.variant || 'info'
      })
    },
    logout: function () {
      apiDeleteToken({
        password: this.storeToken.token
      }, () => {
        this.$store.dispatch('setToken', null)
        this.$router.push({ name: 'login' })
      }, {
        codes: [], // Handle all errors by logging out
        callback: () => {
          this.$store.dispatch('setToken', null)
          this.$router.push({ name: 'login' })
        }
      })
    },
    setSearchVisible: function (value) {
      if (value !== undefined && value !== null) {
        this.searchVisible = value
      } else {
        this.searchVisible = !this.searchVisible
      }
    },
    route: function (target) {
      this.$router.push(target)
    }
  },
  created: async function () {
    await apiCheckToken({ token: this.storeToken ? this.storeToken.token : null })

    if (window.speechSynthesis) {
      textSynth = window.speechSynthesis
    }
  },
  mounted: function () {
    loadLanguageAsync(this.storeLocale)

    emitter.on('show-loading', this.toggleLoading)
    emitter.on('speak', this.speak)
    emitter.on('toast', this.toast)
    emitter.on('set-search-visible', this.setSearchVisible)
    emitter.on('route', this.route)
  },
  beforeDestroy: function () {
    emitter.off('show-loading', this.toggleLoading)
    emitter.off('speak', this.speak)
    emitter.off('toast', this.toast)
    emitter.off('set-search-visible', this.setSearchVisible)
    emitter.off('route', this.route)
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

@import url('https://fonts.googleapis.com/css2?family=Montserrat+Subrayada:wght@400;700&display=swap');

.stash-title {
  font-family: 'Montserrat Subrayada', sans-serif;
}

.page-header img {
  max-height: 125px;
}

@media (min-width: 768px) {
  .page-header img {
    max-height: 150px;
  }
}
</style>

<style>
.user-icon {
  height: 25px;
  width: 25px;
}
</style>

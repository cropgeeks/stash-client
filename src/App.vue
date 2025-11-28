<template>
  <v-app>
    <v-main>
      <v-app-bar :extension-height="60" color="primary" absolute class="border-b border-primary border-opacity-100">
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" v-if="smAndDown" />

        <v-img
          class="ms-4"
          style="cursor: pointer" @click="$router.push('/')"
          src="/img/stash.svg"
          max-height="40"
          max-width="40"
          contain
        />

        <v-app-bar-title style="cursor: pointer" @click="$router.push('/')">
          STASH
        </v-app-bar-title>

        <v-spacer />

        <v-btn :icon="store.storeAudioFeedbackEnabled ? mdiVolumeHigh : mdiVolumeMute" @click="store.setAudioFeedbackEnabled(!store.storeAudioFeedbackEnabled)" />
        <v-menu>
          <template #activator="{ props }">
            <v-btn :icon="mdiThemeLightDark" v-bind="props" />
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('menuTheme') }}</v-list-subheader>
            <v-list-item :prepend-icon="mdiWhiteBalanceSunny" :active="store.storeTheme === 'light'" @click="store.setTheme('light')" :title="$t('menuItemThemeLight')"><template #append><v-icon :icon="mdiCheck" v-if="store.storeTheme === 'light'" /></template></v-list-item>
            <v-list-item :prepend-icon="mdiWeatherNight" :active="store.storeTheme === 'dark'" @click="store.setTheme('dark')" :title="$t('menuItemThemeDark')"><template #append><v-icon :icon="mdiCheck" v-if="store.storeTheme === 'dark'" /></template></v-list-item>
            <v-list-item :prepend-icon="mdiDesktopTowerMonitor" :active="store.storeTheme === 'system'" @click="store.setTheme('system')" :title="$t('menuItemThemeSystem')"><template #append><v-icon :icon="mdiCheck" v-if="store.storeTheme === 'system'" /></template></v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" :icon="mdiTranslate" />
          </template>
          <v-list>
            <v-list-subheader class="text-high-emphasis text-uppercase font-weight-black">{{ $t('menuLocale') }}</v-list-subheader>
            <v-list-item
              @click="changeLocale(language.locale)"
              v-for="language in locales"
              :key="`locale-${language.icon}`"
              :value="language.locale"
              :active="language.locale === store.storeLocale"
            >
              <v-list-item-title>{{ language.name }}</v-list-item-title>
              <template #prepend>
                <span class="me-3">{{ language.icon }}</span>
              </template>
              <template #append>
                <v-icon v-if="language.locale === store.storeLocale" :icon="mdiCheck" />
              </template>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-menu>
          <template #activator="{ props }">
            <CustomAvatar class="me-3" :user="{ name: store.storeToken.fullName, id: store.storeToken.id }" v-bind="props" v-if="store.storeToken && store.storeToken.token" />
            <v-btn :icon="mdiAccount" v-bind="props" v-else />
          </template>

          <v-list>
            <template v-if="store.storeUserIsAdmin">
              <v-list-item :title="$t('dropdownUsers')" to="/user" :prepend-icon="mdiAccountMultiple" />
              <v-divider />
            </template>
            <template v-if="store.storeToken">
              <v-list-item :title="$t('dropdownChangePassword')" :prepend-icon="mdiKeyChange" @click="" />
              <v-list-item :title="$t('dropdownSignOut')" :prepend-icon="mdiLogout" @click="logout" />
            </template>
            <v-list-item :title="$t('dropdownSignIn')" :prepend-icon="mdiLogin" to="/login" v-else />
          </v-list>
        </v-menu>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        :location="mdAndUp ? 'start' : 'top'"
        absolute
        :rail="mdAndUp"
        :permanent="mdAndUp"
        :expand-on-hover="mdAndUp"
      >
        <v-list density="compact" slim nav>
          <v-list-item :prepend-icon="mdiHome" :title="$t('menuHome')" to="/" />
          <v-list-item :prepend-icon="mdiPackageCheck" :title="$t('menuContainers')" to="/container" />
          <template v-if="store.storeUserIsRegular">
            <v-list-item :prepend-icon="mdiImport" :title="$t('menuImport')" to="/import" />
            <v-list-item :prepend-icon="mdiTransferRight" :title="$t('menuMove')" to="/move" />
            <v-list-item :prepend-icon="mdiTransfer" :title="$t('menuTransfer')" to="/transfer" />
          </template>
          <v-list-item :prepend-icon="mdiInformation" :title="$t('menuAbout')" to="/about" />
        </v-list>
      </v-navigation-drawer>

      <div class="h-100">
        <router-view :key="$route.path" class="h-100" />
      </div>
    </v-main>

    <ConfirmModal />
    <v-snackbar-queue timeout="4000" location="bottom" v-model="snackbarQueue" />
    <v-overlay
      :model-value="loading"
      class="align-center justify-center"
      :close-on-content-click="false"
      persistent
    >
      <v-card :title="$t('modalTitleLoading')" width="min(50vw, 400px)" class="d-flex align-center justify-center" :loading="loading">
        <template #loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          />
        </template>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
  import { mdiAccount, mdiAccountMultiple, mdiCheck, mdiDesktopTowerMonitor, mdiHome, mdiImport, mdiInformation, mdiKeyChange, mdiLogin, mdiLogout, mdiPackageCheck, mdiThemeLightDark, mdiTransfer, mdiTransferRight, mdiTranslate, mdiVolumeHigh, mdiVolumeMute, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js'
  import { coreStore } from '@/stores/app'
  import { loadLanguageAsync, locales } from '@/plugins/vuetify'
  import { useDisplay, useTheme, type SnackbarQueueMessage } from 'vuetify'
  import Plausible from 'plausible-tracker'
  import { useDark } from '@vueuse/core'
  import { stashVersion } from '@/plugins/constants'

  import emitter from 'tiny-emitter/instance'
  import { apiDeleteToken } from '@/plugins/api/auth'
  import { apiPostContainerTypeTable } from '@/plugins/api/container'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  let plausible: any
  let textSynth: SpeechSynthesis | undefined = undefined

  // Set base URL based on environment
  let baseUrl = './api/'
  if (import.meta.env.VITE_BASE_URL) {
    baseUrl = import.meta.env.VITE_BASE_URL
  }

  const store = coreStore()
  const router = useRouter()
  const theme = useTheme()
  const isDark = useDark()

  const loading = ref(false)
  const drawer = ref(true)
  const snackbarQueue = ref<SnackbarQueueMessage[]>([])
  const { mdAndUp, smAndDown } = useDisplay()

  function changeLocale (locale: string) {
    store.setLocale(locale)
  }
  function showSnackbar (message: SnackbarQueueMessage) {
    snackbarQueue.value.push(message)
  }
  function showLoading (visible: boolean) {
    loading.value = visible
  }
  function enablePlausible () {
    if (store.storePlausible) {
      plausible = Plausible({
        domain: store.storePlausible.plausibleDomain,
        apiHost: store.storePlausible.plausibleApiHost,
        trackLocalhost: false,
        hashMode: store.storePlausible.plausibleHashMode || true,
      })

      plausible.enableAutoPageviews()

      let pwaMode = null
      try {
        if (document.referrer.startsWith('android-app://'))
          pwaMode = 'twa'
        if (window.matchMedia('(display-mode: browser)').matches)
          pwaMode = 'browser'
        // @ts-ignore
        if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone)
          pwaMode = 'standalone'
        if (window.matchMedia('(display-mode: minimal-ui)').matches)
          pwaMode = 'minimal-ui'
        if (window.matchMedia('(display-mode: fullscreen)').matches)
          pwaMode = 'fullscreen'
        if (window.matchMedia('(display-mode: window-controls-overlay)').matches)
          pwaMode = 'window-controls-overlay'
      } catch (e) {
        console.error(e)
      }

      plausibleEvent({ key: 'app-load', props: { version: stashVersion, pwaMode: pwaMode || 'N/A' } })
    }
  }

  function isLocalhost () {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === ''
  }

  function plausibleEvent (data: any) {
    if (plausible && store.storePlausible.plausibleDomain && data) {
      if (data.props) {
        plausible.trackEvent(data.key, { props: data.props })
      } else {
        plausible.trackEvent(data.key)
      }
    }
  }

  function logout () {
    apiDeleteToken({
      username: '',
      password: store.storeToken?.token || '',
    }, () => {
      store.setToken(undefined)
      router.push('/login')
    }, {
      codes: [], // Handle all errors by logging out
      callback: () => {
        store.setToken(undefined)
        router.push('/login')
      },
    })
  }

  function tts (text: string, interruptPrev = true) {
    if (textSynth) {
      if (interruptPrev) {
        textSynth.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      // utterance.rate = 1.2
      textSynth.speak(utterance)
    }
  }

  function initTts () {
    if (store.storeAudioFeedbackEnabled && window.speechSynthesis) {
      textSynth = window.speechSynthesis
    } else {
      textSynth = undefined
    }
  }

  // Listen for theme changes in the store
  watchEffect(() => {
    const str = isDark.value ? 'dark' : 'light'
    theme.change(store.storeTheme === 'system' ? str : store.storeTheme)
    store.setSystemTheme(str)
  })

  // Listen for changes to store locale and update Vuetify current
  watchEffect(() => {
    loadLanguageAsync(store.storeLocale)
  })

  onBeforeMount(() => {
    loadLanguageAsync(store.storeLocale)
    store.setServerUrl(baseUrl)

    apiPostContainerTypeTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
    }, result => {
      if (result && result.data) {
        store.setContainerTypes(result.data)
      } else {
        store.setContainerTypes([])
      }
    })

    emitter.on('show-snackbar', showSnackbar)
    emitter.on('show-loading', showLoading)
    emitter.on('tts', tts)
  })

  onMounted(() => initTts())

  watch(() => store.storeAudioFeedbackEnabled, async () => initTts())

  onBeforeUnmount(() => {
    emitter.off('show-snackbar', showSnackbar)
    emitter.off('show-loading', showLoading)
    emitter.off('tts', tts)
  })
</script>

<style>
</style>

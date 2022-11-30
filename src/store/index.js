import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

let name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'stash-' + window.location.pathname
}

export default new Vuex.Store({
  state: {
    serverUrl: null,
    locale: 'en_GB',
    token: null,
    audioFeedbackEnabled: true
  },
  getters: {
    storeServerUrl: (state) => state.serverUrl,
    storeLocale: (state) => state.locale,
    storeToken: (state) => state.token,
    storeAudioFeedbackEnabled: (state) => state.audioFeedbackEnabled
  },
  mutations: {
    ON_SERVER_URL_CHANGED: function (state, newServerUrl) {
      state.serverUrl = newServerUrl
    },
    ON_LOCALE_CHANGED: function (state, newLocale) {
      state.locale = newLocale
    },
    ON_TOKEN_CHANGED: function (state, newToken) {
      state.token = newToken
    },
    ON_AUDIO_FEEDBACK_ENABLED_CHANGED: function (state, newAudioFeedbackEnabled) {
      state.audioFeedbackEnabled = newAudioFeedbackEnabled
    }
  },
  actions: {
    setServerUrl: function ({ commit }, serverUrl) {
      commit('ON_SERVER_URL_CHANGED', serverUrl)
    },
    setLocale: function ({ commit }, locale) {
      commit('ON_LOCALE_CHANGED', locale)
    },
    setToken: function ({ commit }, token) {
      commit('ON_TOKEN_CHANGED', token)
    },
    setAudioFeedbackEnabled: function ({ commit }, audioFeedbackEnabled) {
      commit('ON_AUDIO_FEEDBACK_ENABLED_CHANGED', audioFeedbackEnabled)
    }
  },
  plugins: [createPersistedState()]
})

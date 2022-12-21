import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const localStorage = window.localStorage

let name = process.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'stash-' + window.location.pathname
}

const userState = {
  locale: 'en_GB',
  audioFeedbackEnabled: true
}

export default new Vuex.Store({
  state: {
    serverUrl: null,
    token: null,
    userStates: {
      null: JSON.parse(JSON.stringify(userState))
    }
  },
  getters: {
    storeUserId: (state) => state.token ? state.token.id : null,
    storeToken: (state) => state.token,
    storeServerUrl: (state) => state.serverUrl,
    storeLocale: (state, getters) => state.userStates[getters.storeUserId].locale,
    storeAudioFeedbackEnabled: (state, getters) => state.userStates[getters.storeUserId].audioFeedbackEnabled
  },
  mutations: {
    ON_SERVER_URL_CHANGED: function (state, newServerUrl) {
      state.serverUrl = newServerUrl
    },
    ON_TOKEN_CHANGED: function (state, newToken) {
      if (newToken && !state.userStates[newToken.id]) {
        // Add the new user to the state, remember to use Vue.set to make it reactive
        Vue.set(state.userStates, newToken.id, JSON.parse(JSON.stringify(userState)))
      }

      if (newToken === null) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }

      state.token = newToken
    },
    ON_LOCALE_CHANGED: function (state, newLocale) {
      state.userStates[state.token ? state.token.id : null].locale = newLocale
    },
    ON_AUDIO_FEEDBACK_ENABLED_CHANGED: function (state, newAudioFeedbackEnabled) {
      state.userStates[state.token ? state.token.id : null].audioFeedbackEnabled = newAudioFeedbackEnabled
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
  plugins: [
    createPersistedState({
      key: name,
      storage: {
        getItem: key => {
          // Get the value and parse it
          const result = JSON.parse(localStorage.getItem(key))

          // If it exists and there is user state data
          if (result && result.userStates) {
            // Then for each user state, set the defaults for those fields that aren't stored (because of declined cookies (GDPR))
            Object.keys(result.userStates).forEach(us => {
              result.userStates[us] = Object.assign(JSON.parse(JSON.stringify(userState)), result.userStates[us])
            })
          }

          return JSON.stringify(result)
        },
        setItem: (key, value) => localStorage.setItem(key, value),
        removeItem: key => localStorage.removeItem(key)
      },
      reducer: (state) => {
        let result = {}
        try {
          result = JSON.parse(JSON.stringify(state))
        } catch (err) {
          console.error(err)
        }

        // // Check if GDPR settings are active
        // if (result.userStates && result.serverSettings && result.serverSettings.showGdprNotification) {
        //   // If so, for each user
        //   Object.keys(result.userStates).forEach(u => {
        //     const currentUserState = result.userStates[u]

        //     // If they haven't accepted cookies, remove the keys that aren't flagged as "essential cookies"
        //     if (currentUserState.cookiesAccepted !== true) {
        //       Object.keys(currentUserState).forEach(k => {
        //         if (essentialKeys.indexOf(k) === -1) {
        //           delete currentUserState[k]
        //         }
        //       })
        //     }
        //   })
        // }

        return result
      }
    })
  ]
})

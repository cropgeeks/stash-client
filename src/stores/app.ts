// Utilities
import { userIsAtLeast } from '@/plugins/api/auth'
import { UsersUserType, type Attributes, type ContainerTypes, type Token } from '@/plugins/types/stash'
import { defineStore } from 'pinia'

let name = import.meta.env.VUE_APP_INSTANCE_NAME

if (!name) {
  name = 'stash-' + window.location.pathname
}

export interface PlausibleConfig {
  plausibleDomain: string | undefined
  plausibleHashMode: boolean
  plausibleApiHost: string | undefined
}

export interface StoreContent {
  theme: string
  systemTheme: string
  locale: string
  audioFeedbackEnabled: boolean
}
type UserState = { [key: number]: StoreContent }

const defaultUserState: StoreContent = {
  theme: 'light',
  systemTheme: 'dark',
  locale: 'en-GB',
  audioFeedbackEnabled: true,
}

export const coreStore = defineStore('core', {
  state: () => ({
    locale: 'en-GB',
    plausible: {
      plausibleDomain: undefined,
      plausibleHashMode: true,
      plausibleApiHost: undefined,
    } as PlausibleConfig,
    userStates: {
      '-1': JSON.parse(JSON.stringify(defaultUserState)),
    } as UserState,
    token: undefined as Token | undefined,
    serverUrl: null as (string | null),
    containerTypes: [] as ContainerTypes[],
    containerAttributes: [] as Attributes[],
  }),
  getters: {
    storeUserIsAdmin: (state): boolean => {
      if (state.token) {
        return userIsAtLeast(state.token.userType, UsersUserType.admin)
      } else {
        return false
      }
    },
    storeUserIsRegular: (state): boolean => {
      if (state.token) {
        return userIsAtLeast(state.token.userType, UsersUserType.regular)
      } else {
        return false
      }
    },
    storeUserIsReference: (state): boolean => {
      if (state.token) {
        return userIsAtLeast(state.token.userType, UsersUserType.reference)
      } else {
        return false
      }
    },
    storeUserId: (state): number => state.token ? state.token.id : -1,
    storeToken: (state): Token | undefined => state.token,
    storeContainerTypes: (state): ContainerTypes[] => state.containerTypes || [],
    storeContainerTypeMap: (state): { [index: number]: ContainerTypes } => {
      const result: { [index: number]: ContainerTypes } = {}

      state.containerTypes.forEach(ct => {
        result[ct.id || -1] = ct
      })

      return result
    },
    storeContainerAttributes: (state): Attributes[] => state.containerAttributes || [],
    storeContainerAttributeMap: (state): { [index: number]: Attributes } => {
      const result: { [index: number]: Attributes } = {}

      state.containerAttributes.forEach(ct => {
        result[ct.id || -1] = ct
      })

      return result
    },
    storeLocale: (state): string => (state.locale || 'en-GB').replace('_', '-'),
    storePlausible: (state): PlausibleConfig => state.plausible,
    storeTheme (): string {
      return this.userStates[this.storeUserId].theme || 'system'
    },
    storeAudioFeedbackEnabled (): boolean {
      return this.userStates[this.storeUserId].audioFeedbackEnabled || false
    },
    storeServerUrl: (state): string | null => state.serverUrl,
    storeIsDarkMode (): boolean {
      return (this.userStates[this.storeUserId].theme === 'system' ? this.userStates[this.storeUserId].systemTheme : this.userStates[this.storeUserId].theme) === 'dark'
    },
    storeSystemTheme (): string {
      return this.userStates[this.storeUserId].systemTheme || 'dark'
    },
  },
  actions: {
    setLocale (newLocale: string) {
      this.locale = newLocale
    },
    setContainerTypes (newContainerTypes: ContainerTypes[]) {
      this.containerTypes = newContainerTypes
    },
    setContainerAttributes (newContainerAttributes: Attributes[]) {
      this.containerAttributes = newContainerAttributes
    },
    setPlausible (newPlausible: PlausibleConfig) {
      this.plausible = newPlausible
    },
    setSystemTheme (newSystemTheme: string) {
      this.userStates[this.storeUserId].systemTheme = newSystemTheme
    },
    setTheme (newTheme: string) {
      this.userStates[this.storeUserId].theme = newTheme
    },
    setAudioFeedbackEnabled (newAudioFeedbackEnabled: boolean) {
      this.userStates[this.storeUserId].audioFeedbackEnabled = newAudioFeedbackEnabled
    },
    setServerUrl (newServerUrl: string) {
      this.serverUrl = newServerUrl
    },
    setToken (newToken: Token | undefined) {
      if (newToken && !this.userStates[newToken.id]) {
        this.userStates[newToken.id] = JSON.parse(JSON.stringify(defaultUserState))
      }

      if (!newToken) {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }

      this.token = newToken
    },
  },
  persist: {
    key: name,
  },
})

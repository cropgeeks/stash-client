<template>
  <b-avatar :variant="variant" :text="userInitials" :size="size" :src="url" />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    user: {
      type: Object,
      default: () => null
    },
    size: {
      type: String,
      default: '2.5em'
    },
    variant: {
      type: String,
      default: 'light'
    },
    searchParams: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerUrl'
    ]),
    url: function () {
      let baseUrl = this.storeServerUrl
      if (this.storeServerUrl.startsWith('.') || this.storeServerUrl.startsWith('/')) {
        const anchor = document.createElement('a')
        anchor.href = this.storeServerUrl
        baseUrl = anchor.href
      }

      const result = new URL(`user/${this.user.id}/img`, baseUrl)
      result.searchParams.append('imageToken', this.storeToken.imageToken)

      if (this.searchParams) {
        Object.keys(this.searchParams).filter(k => this.searchParams[k] !== undefined && this.searchParams[k] !== null).forEach(k => result.searchParams.append(k, this.searchParams[k]))
      }

      return result.href
    },
    userInitials: function () {
      return this.user ? (this.user.name || '').split(' ').slice(0, 2).map(p => p.substring(0, 1)).join('') : null
    }
  }
}
</script>

<style>

</style>

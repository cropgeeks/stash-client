<template>
  <v-avatar color="muted" class="d-flex" :size="size">
    <span class="position-absolute text-h6 font-weight-light">{{ userInitials }}</span>
    <v-img class="position-absolute" :src="imageUrl" />
  </v-avatar>
</template>

<script setup lang="ts">
  import type { Users } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'

  interface CustomAvatarProps {
    user: Users
    searchParams?: { [index: string]: string | undefined }
    size?: string
  }

  const compProps = withDefaults(defineProps<CustomAvatarProps>(), {
    size: 'default',
  })

  const store = coreStore()

  const imageUrl = computed(() => {
    let baseUrl = store.storeServerUrl || ''
    if (baseUrl.startsWith('.') || baseUrl.startsWith('/')) {
      const anchor = document.createElement('a')
      anchor.href = baseUrl
      baseUrl = anchor.href
    }

    const result = new URL(`user/${compProps.user.id}/img`, baseUrl)
    if (store.storeToken) {
      result.searchParams.append('imageToken', store.storeToken.imageToken)
    }

    const sp = compProps.searchParams
    if (sp) {
      Object.keys(sp).filter(k => sp[k] !== undefined && sp[k] !== null).forEach(k => result.searchParams.append(k, sp[k] || ''))
    }

    return result.href
  })

  const userInitials = computed(() => {
    return compProps.user ? (compProps.user.name || '').split(' ').slice(0, 2).map(p => p.slice(0, 1)).join('') : undefined
  })
</script>

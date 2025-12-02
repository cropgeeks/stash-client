<template>
  <v-list-item class="mx-0 px-0" @click="parentClick">
    <template #prepend>
      <ContainerTypeChip :container-type="{ name: store.storeContainerTypeMap[container.containerTypeId].name, icon: store.storeContainerTypeMap[container.containerTypeId].icon, description: store.storeContainerTypeMap[container.containerTypeId].description }" class="me-3" />
    </template>
    <template #title>
      <span class="text-wrap">{{ container.containerBarcode }}</span>
    </template>
    <template #subtitle v-if="containerDescription">
      <span class="text-wrap">{{ containerDescription }}</span>
    </template>
    <template #append v-if="showDelete === true">
      <v-btn :icon="mdiDelete" color="error" @click="emit('delete')" />
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
  import type { ViewTableContainers } from '@/plugins/types/stash'
  import { getContainerDescription } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiDelete } from '@mdi/js'

  const store = coreStore()

  const compProps = defineProps<{
    container: ViewTableContainers
    showDelete: boolean
    parentClick?: () => void
  }>()

  const containerDescription = computed(() => {
    if (compProps.container) {
      return getContainerDescription(compProps.container)
    } else {
      return undefined
    }
  })

  const emit = defineEmits(['delete'])
</script>

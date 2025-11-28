<template>
  <v-dialog v-model="dialog" fullscreen scrollable>
    <v-card>
      <template #title>
        <div class="d-flex justify-space-between align-center">
          <span>{{ $t('modalTitleContainerHistory') }}</span>
          <v-btn :icon="mdiClose" variant="text" @click="hide" />
        </div>
      </template>

      <v-card-text>
        <ContainerListItem :container="container" :show-delete="false" />

        <v-tabs v-model="tab" color="primary">
          <v-tab :value="0" :text="$t('tabsContainerHistorySelf')" />
          <v-tab :value="1" :text="$t('tabsContainerHistoryChild')" :disabled="container.subContainerCount === 0" />
        </v-tabs>

        <v-divider class="mb-5" />

        <v-tabs-window v-model="tab">
          <v-tabs-window-item eager :value="0">
            <p>{{ $t('tabsContainerHistorySelfText') }}</p>
            <ContainerTransferList :container-id="container.containerId" />
          </v-tabs-window-item>
          <v-tabs-window-item eager :value="1">
            <p>{{ $t('tabsContainerHistoryChildText') }}</p>
            <ContainerTransferList :parent-id="container.containerId" />
          </v-tabs-window-item>
        </v-tabs-window>
      </v-card-text>

      <template #actions>
        <v-spacer />
        <v-btn :text="$t('buttonClose')" @click="hide" color="primary" variant="tonal" />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import type { ViewTableContainers } from '@/plugins/types/stash'
  import { mdiClose } from '@mdi/js'

  const compProps = defineProps<{
    container: ViewTableContainers
  }>()

  const dialog = ref(false)
  const tab = ref(0)

  function show () {
    tab.value = 0
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  defineExpose({
    show,
    hide,
  })
</script>

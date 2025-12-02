<template>
  <v-dialog v-model="dialog" fullscreen scrollable>
    <v-card>
      <template #title>
        <div class="d-flex justify-space-between align-center">
          <span>{{ $t('modalTitleContainerAttributes') }}</span>
          <v-btn :icon="mdiClose" variant="text" @click="hide" />
        </div>
      </template>

      <v-card-text>
        <ContainerListItem :container="container" :show-delete="false" />

        <ContainerAttributeCard
          class="mb-3"
          v-for="attributes in containerAttibutes"
          :key="`container-attributes-${attributes.id}`"
          :attributes="attributes"
        />
      </v-card-text>

      <template #actions>
        <v-spacer />
        <v-btn :text="$t('buttonClose')" @click="hide" color="primary" variant="tonal" />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { apiGetContainerAttributes } from '@/plugins/api/container'
  import type { ContainerAttributes, ViewTableContainers } from '@/plugins/types/stash'
  import { mdiClose } from '@mdi/js'

  const compProps = defineProps<{
    container: ViewTableContainers
  }>()

  const containerAttibutes = ref<ContainerAttributes[]>([])

  const dialog = ref(false)

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  watch(() => compProps.container, async newValue => {
    if (newValue) {
      apiGetContainerAttributes(newValue.containerId || -1)
        .then(result => {
          if (result && result.data) {
            containerAttibutes.value = result.data
          } else {
            containerAttibutes.value = []
          }
        })
    } else {
      containerAttibutes.value = []
    }
  }, { immediate: true })

  defineExpose({
    show,
    hide,
  })
</script>

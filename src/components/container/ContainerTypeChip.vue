<template>
  <v-chip :color="color" label :text="containerType.description || containerType.name">
    <template #prepend v-if="containerType.icon">
      <v-icon class="me-3">
        <span v-html="containerType.icon" />
      </v-icon>
    </template>
  </v-chip>
</template>

<script setup lang="ts">
  import type { ContainerTypes } from '@/plugins/types/stash'

  export interface ContainerTypeChipProps {
    containerType: ContainerTypes
    color?: string
  }

  const compProps = withDefaults(defineProps<ContainerTypeChipProps>(), {
    color: undefined,
  })
</script>

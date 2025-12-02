<template>
  <v-card v-if="attributes">
    <template #title>
      <div class="d-flex justify-space-between flex-wrap">
        <span>{{ $t('widgetContainerAttributesTitle') }}</span>
        <v-chip label :text="new Date(attributes.createdOn).toLocaleDateString()" />
      </div>
    </template>

    <v-row class="mb-1">
      <v-col
        cols="12" sm="6" md="4" lg="3"
        v-for="(value, key) in attributes.attributeValues"
        :key="`attribute-value-${attributes.id}-${key}`"
      >
        <v-list-item
          :subtitle="value"
        >
          <template #title>
            <span class="text-wrap">{{ store.storeContainerAttributeMap[+key]?.name }}</span>
          </template>
        </v-list-item>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
  import type { ContainerAttributes } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    attributes: ContainerAttributes
  }>()

  const store = coreStore()
</script>

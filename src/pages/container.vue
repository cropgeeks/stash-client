<template>
  <v-container>
    <v-btn-toggle
      v-model="selectedContainerType"
      class="mb-3"
      variant="tonal"
      color="primary"
    >
      <v-btn
        v-for="type in store.storeContainerTypes"
        :key="`container-type-${type.id}`"
        :value="type.id"
        :text="type.description || type.name"
      >
        <template #prepend v-if="type.icon"><span v-html="type.icon" /></template>
      </v-btn>
    </v-btn-toggle>

    <ContainerTable :get-items="getContainers" ref="containerTable" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostContainerTable } from '@/plugins/api/container'
  import { FilterComparator, FilterOperator, type PaginatedRequest, type PaginatedResult, type ViewTableContainers } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'

  const store = coreStore()

  const containerTable = useTemplateRef('containerTable')

  const selectedContainerType = ref<number>()

  function getContainers (request: PaginatedRequest) {
    const copy: PaginatedRequest = JSON.parse(JSON.stringify(request))

    if (!copy.filters || !copy.filters[0]) {
      copy.filters = [{
        operator: FilterOperator.and,
        filters: [],
      }]
    }

    if (!copy.filters[0].filters) {
      copy.filters[0].filters = []
    }

    if (selectedContainerType.value) {
      copy.filters[0].filters?.push({
        column: 'containerTypeId',
        comparator: FilterComparator.inSet,
        values: [`${selectedContainerType.value}`],
      })
    }

    return new Promise<PaginatedResult<ViewTableContainers[]>>((resolve, reject) => {
      apiPostContainerTable(copy)
        .then(result => resolve(result.data))
        .catch(e => reject(e))
    })
  }

  watch(selectedContainerType, async () => containerTable.value?.refresh())
</script>

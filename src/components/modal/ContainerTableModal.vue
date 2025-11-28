<template>
  <v-dialog v-model="dialog" fullscreen scrollable>
    <v-card>
      <template #title>
        <div class="d-flex justify-space-between align-center">
          <span>{{ $t('modalTitleContainerContent') }}</span>
          <v-btn :icon="mdiClose" variant="text" @click="hide" />
        </div>
      </template>
      <template #text>
        <ContainerListItem :container="container" :show-delete="false" />

        <p>{{ $t('modalTextContainerContent') }}</p>

        <ContainerTable :get-items="getContainers" v-if="dialog" />
      </template>

      <template #actions>
        <v-spacer />
        <v-btn :text="$t('buttonClose')" @click="hide" color="primary" variant="tonal" />
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { apiPostContainerTable } from '@/plugins/api/container'
  import { FilterComparator, FilterOperator, type PaginatedRequest, type PaginatedResult, type ViewTableContainers } from '@/plugins/types/stash'
  import { mdiClose } from '@mdi/js'

  const compProps = defineProps<{
    container: ViewTableContainers
  }>()

  const dialog = ref(false)

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  function getContainers (request: PaginatedRequest) {
    const copy: PaginatedRequest = JSON.parse(JSON.stringify(request))

    if (!copy.filters || copy.filters.length === 0) {
      copy.filters = [{
        filterGroups: [],
        operator: FilterOperator.and,
      }]
    }

    copy.filters[0].filterGroups?.push({
      filters: [{
        column: 'parentId',
        comparator: FilterComparator.equals,
        values: [`${compProps.container.containerId}`],
      }],
      operator: FilterOperator.and,
    })

    return new Promise<PaginatedResult<ViewTableContainers[]>>((resolve, reject) => {
      apiPostContainerTable(copy)
        .then(result => resolve(result.data))
        .catch(e => reject(e))
    })
  }

  defineExpose({
    show,
    hide,
  })
</script>

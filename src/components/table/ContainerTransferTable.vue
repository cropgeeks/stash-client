<template>
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :loading="loading"
    striped="odd"
    hover
    item-value="containerId"
    @update:options="loadItems"
  >
    <template #item.containerDescription="{ item }">
      {{ getContainerDescription({ containerBarcode: item.containerBarcode, containerTypeId: -1, containerAttributes: item.containerAttributes }) }}
    </template>
    <template #item.sourceDescription="{ item }">
      {{ getContainerDescription({ containerBarcode: item.sourceBarcode, containerTypeId: -1, containerAttributes: item.sourceAttributes }) }}
    </template>
    <template #item.targetDescription="{ item }">
      {{ getContainerDescription({ containerBarcode: item.targetBarcode, containerTypeId: -1, containerAttributes: item.targetAttributes }) }}
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
  import type { ViewTableTransfers, PaginatedRequest, PaginatedResult, FilterGroup } from '@/plugins/types/stash'
  import { getContainerDescription } from '@/plugins/util'
  import { useI18n } from 'vue-i18n'
  import type { DataTableSortItem } from 'vuetify'

  const compProps = defineProps<{
    getItems: (request: PaginatedRequest) => Promise<PaginatedResult<ViewTableTransfers[]>>
  }>()

  const { t } = useI18n()

  const itemsPerPage = ref(10)
  const loading = ref(false)
  const serverItems = ref<ViewTableTransfers[]>([])
  const totalItems = ref(0)
  const filters = ref<FilterGroup[]>([])

  const headers = computed(() => {
    return [{
      key: 'containerBarcode',
      title: t('tableColumnTransferLogContainerBarcode'),
    }, {
      key: 'containerDescription',
      title: t('tableColumnTransferLogContainerDescription'),
    }, {
      key: 'sourceBarcode',
      title: t('tableColumnTransferLogSourceBarcode'),
    }, {
      key: 'sourceDescription',
      title: t('tableColumnTransferLogSourceDescription'),
    }, {
      key: 'targetBarcode',
      title: t('tableColumnTransferLogTargetBarcode'),
    }, {
      key: 'targetDescription',
      title: t('tableColumnTransferLogTargetDescription'),
    }, {
      key: 'userName',
      title: t('tableColumnTransferLogUserName'),
    }, {
      key: 'createdOn',
      title: t('tableColumnTransferLogCreatedOn'),
      value: (value: ViewTableTransfers) => value.createdOn ? new Date(value.createdOn).toLocaleString() : undefined,
    }]
  })

  function loadItems ({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy?: DataTableSortItem[] }) {
    loading.value = true

    compProps.getItems({
      page: page,
      limit: itemsPerPage,
      prevCount: totalItems.value || -1,
      orderBy: (sortBy && sortBy.length > 0) ? sortBy[0].key : undefined,
      ascending: (sortBy && sortBy.length > 0) ? (sortBy[0].order === 'asc' ? 1 : 0) : undefined,
      filters: filters.value,
    }).then(result => {
      if (result && result.data) {
        serverItems.value = result.data
        totalItems.value = result.count
        loading.value = false
      }
    })
  }
</script>

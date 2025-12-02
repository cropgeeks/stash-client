<template>
  <v-text-field
    v-model="searchTerm"
    type="search"
    :prepend-inner-icon="mdiMagnify"
    :label="$t('formLabelUserSearch')"
    :append-inner-icon="mdiArrowRight"
    @click:append-inner="runSearch"
    @keyup.enter="runSearch"
    clearable
    @click:clear="runSearch"
    hide-details
  />
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :loading="loading"
    striped="odd"
    hover
    :search="search"
    @click:row="handleClick"
    item-value="containerId"
    @update:options="loadItems"
  >
    <template #item.containerTypeId="{ item }">
      <ContainerTypeChip :container-type="{ name: store.storeContainerTypeMap[item.containerTypeId].name, icon: store.storeContainerTypeMap[item.containerTypeId].icon, description: store.storeContainerTypeMap[item.containerTypeId].description }" />
    </template>
    <template #item.parentContainerTypeId="{ item }">
      <ContainerTypeChip :container-type="{ name: store.storeContainerTypeMap[item.parentContainerTypeId].name, icon: store.storeContainerTypeMap[item.parentContainerTypeId].icon, description: store.storeContainerTypeMap[item.parentContainerTypeId].description }" v-if="item.parentContainerTypeId" />
    </template>
    <template #item.containerIsActive="{ item }">
      <v-chip label :text="item.containerIsActive" :color="item.containerIsActive ? 'success' : 'warning'" />
    </template>
    <template #item.containerDescription="{ item }">
      {{ getContainerDescription(item) }}
    </template>
  </v-data-table-server>

  <v-bottom-sheet
    v-model="bottomSheetVisible"
    v-if="selectedContainer"
    inset
    max-height="75vh"
  >
    <ContainerCard v-model="selectedContainer" />
  </v-bottom-sheet>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostContainerTypeTable } from '@/plugins/api/container'
  import { type ViewTableContainers, type PaginatedRequest, type PaginatedResult, type FilterGroup, FilterComparator, FilterOperator, type ContainerTypes } from '@/plugins/types/stash'
  import { getContainerDescription } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiArrowRight, mdiMagnify } from '@mdi/js'
  import { useI18n } from 'vue-i18n'
  import type { DataTableSortItem } from 'vuetify'

  const compProps = defineProps<{
    getItems: (request: PaginatedRequest) => Promise<PaginatedResult<ViewTableContainers[]>>
  }>()

  const { t } = useI18n()

  const store = coreStore()
  const searchTerm = ref<string>()
  const search = ref<string>()
  const itemsPerPage = ref(10)
  const loading = ref(false)
  const serverItems = ref<ViewTableContainers[]>([])
  const totalItems = ref(0)
  const filters = ref<FilterGroup[]>([])
  const containerTypes = ref<ContainerTypes[]>([])
  const selectedContainer = ref<ViewTableContainers>()

  const bottomSheetVisible = ref(false)

  const headers = computed(() => {
    return [{
      key: 'containerBarcode',
      title: t('tableColumnContainerBarcode'),
    }, {
      key: 'containerDescription',
      title: t('tableColumnContainerDescription'),
    }, {
      key: 'containerTypeId',
      title: t('tableColumnContainerType'),
    }, {
      key: 'parentBarcode',
      title: t('tableColumnContainerParentBarcode'),
    }, {
      key: 'parentContainerTypeId',
      title: t('tableColumnContainerParentType'),
    }, {
      key: 'containerIsActive',
      title: t('tableColumnContainerIsActive'),
    }, {
      key: 'projectName',
      title: t('tableColumnContainerProjectName'),
    }, {
      key: 'trialName',
      title: t('tableColumnContainerTrialName'),
    }, {
      key: 'createdOn',
      title: t('tableColumnContainerCreatedOn'),
      value: (value: ViewTableContainers) => value.createdOn ? new Date(value.createdOn).toLocaleDateString() : undefined,
    }]
  })

  function runSearch () {
    const trimmed = searchTerm.value?.trim() || ''
    totalItems.value = 0

    if (trimmed.length === 0) {
      filters.value = []
    } else {
      filters.value = [{
        filterGroups: [{
          filters: [{
            column: 'containerBarcode',
            comparator: FilterComparator.contains,
            values: [trimmed],
          }, {
            column: 'containerAttributes',
            comparator: FilterComparator.jsonSearch,
            values: [trimmed],
          }, {
            column: 'parentBarcode',
            comparator: FilterComparator.contains,
            values: [trimmed],
          }, {
            column: 'projectName',
            comparator: FilterComparator.contains,
            values: [trimmed],
          }, {
            column: 'trialName',
            comparator: FilterComparator.contains,
            values: [trimmed],
          }],
          operator: FilterOperator.or,
        }],
        operator: FilterOperator.and,
      }]
    }

    nextTick(() => {
      search.value = `${Date.now()}`
    })
  }

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

  function handleClick (event: Event, row: any) {
    selectedContainer.value = row.item

    nextTick(() => {
      bottomSheetVisible.value = true
    })
  }

  function refresh () {
    runSearch()
  }

  onMounted(() => {
    apiPostContainerTypeTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
    }, result => {
      containerTypes.value = result.data || []
    })
  })

  defineExpose({
    refresh,
  })
</script>

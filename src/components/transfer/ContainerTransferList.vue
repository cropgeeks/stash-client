<template>
  <v-data-iterator :items="totalItems" v-model:page="page" v-model:items-per-page="perPage">
    <template #header="{ pageCount }">
      <v-pagination v-model="page" :length="pageCount" v-if="pageCount > 1" />
    </template>
    <template #default="{ items }">
      <template
        v-for="item in items"
        :key="`${item.raw.eventId}`"
      >
        <v-card class="mb-3">
          <template #text>
            <v-row>
              <v-col cols="12" sm="4">
                <div v-if="item.raw.sourceId" class="d-flex justify-center flex-column align-center">
                  <v-img
                    width="min(100%, 100px)"
                    src="/img/container.svg"
                  />
                  <span class="v-list-item-title">{{ item.raw.sourceBarcode }}</span>
                  <ContainerTypeChip :container-type="{ name: store.storeContainerTypeMap[item.raw.sourceTypeId].name, icon: store.storeContainerTypeMap[item.raw.sourceTypeId].icon, description: store.storeContainerTypeMap[item.raw.sourceTypeId].description }" />
                </div>
              </v-col>
              <v-col cols="12" sm="4" class="d-flex justify-center flex-column align-center">
                <v-img
                  width="min(100%, 100px)"
                  :class="{
                    'rotate-minus-90': smAndUp,
                    'py-3': true
                  }"
                  src="/img/transfer-arrow.svg"
                />
                <v-list-item>
                  <template #prepend>
                    <CustomAvatar :user="{ id: item.raw.userId, name: item.raw.userName }" />
                  </template>
                  <template #title>
                    <span class="text-wrap">{{ $t('modalTextContainerHistoryTransferEventCount', { count: item.raw.containerCount, date: new Date(item.raw.timestamp).toLocaleString(), name: item.raw.userName }) }}</span>
                  </template>
                </v-list-item>
              </v-col>
              <v-col cols="12" sm="4">
                <div v-if="item.raw.targetId" class="d-flex justify-center flex-column align-center">
                  <v-img
                    width="min(100%, 100px)"
                    src="/img/container.svg"
                  />
                  <span class="v-list-item-title">{{ item.raw.targetBarcode }}</span>
                  <ContainerTypeChip :container-type="{ name: store.storeContainerTypeMap[item.raw.targetTypeId].name, icon: store.storeContainerTypeMap[item.raw.targetTypeId].icon, description: store.storeContainerTypeMap[item.raw.targetTypeId].description }" />
                </div>
              </v-col>
            </v-row>
          </template>
        </v-card>
      </template>
    </template>
    <template #footer="{ pageCount }">
      <v-pagination v-model="page" :length="pageCount" v-if="pageCount > 1" />
    </template>
  </v-data-iterator>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostContainerTransferEventTable } from '@/plugins/api/container'
  import { FilterComparator, FilterOperator, type FilterGroup, type ViewTableTransferEvents } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'
  import { useDisplay } from 'vuetify'

  const compProps = defineProps<{
    parentId?: number
    containerId?: number
  }>()

  const store = coreStore()

  const page = ref(1)
  const perPage = ref(10)
  const totalCount = ref(0)
  const totalItems = ref<ViewTableTransferEvents[]>([])

  const { smAndUp } = useDisplay()

  function update () {
    apiPostContainerTransferEventTable({
      page: page.value,
      limit: MAX_JAVA_INTEGER,
      prevCount: totalCount.value || -1,
      filters: getFilter(),
      orderBy: 'timestamp',
      ascending: 0,
    }, result => {
      if (result && result.data) {
        totalItems.value = result.data
        totalCount.value = result.count
      }
    })
  }

  function getFilter (): FilterGroup[] {
    if (compProps.parentId) {
      return [{
        operator: FilterOperator.or,
        filters: [{
          column: 'sourceId',
          comparator: FilterComparator.equals,
          values: [`${compProps.parentId}`],
        }, {
          column: 'targetId',
          comparator: FilterComparator.equals,
          values: [`${compProps.parentId}`],
        }],
      }]
    } else {
      return [{
        operator: FilterOperator.and,
        filters: [{
          column: 'containerIds',
          comparator: FilterComparator.arrayContains,
          values: [`${compProps.containerId}`],
        }],
      }]
    }
  }

  onMounted(() => {
    update()
  })
</script>

<style scoped>
.rotate-minus-90 {
  transform: rotate(-90deg);
}
</style>

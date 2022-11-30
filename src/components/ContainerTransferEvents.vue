<template>
  <div>
    <b-card v-for="event in items" :key="`${event.sourceId}-${event.targetId}-${event.userId}-${event.date}`" class="mb-3">
      <b-row class="d-flex justify-content-between">
        <b-col cols=12 md=4 class="d-flex flex-column align-items-center justify-content-center">
          <b-img fluid class="container-img" :src="require('@/assets/img/container.svg')" />
          <h4>{{ event.sourceBarcode }}</h4>
          <h5><b-badge>{{ event.sourceType }}</b-badge></h5>
        </b-col>
        <b-col cols=12 md=4 class="d-flex flex-column align-items-center justify-content-center">
          <b-img class="p-3 transfer-arrow" fluid-grow :src="require('@/assets/img/transfer-arrow.svg')" />
          <h6>{{ $t('modalTextContainerHistoryTransferEventCount', { count: event.containerCount, date: new Date(event.date).toLocaleDateString() }) }}</h6>
          <b-button @click="selectEvent(event)"><BIconTable /> {{ $t('buttonShowTable') }}</b-button>
        </b-col>
        <b-col cols=12 md=4 class="d-flex flex-column align-items-center justify-content-center">
          <b-img fluid class="container-img" :src="require('@/assets/img/container.svg')" />
          <h4>{{ event.targetBarcode }}</h4>
          <h5><b-badge>{{ event.targetType }}</b-badge></h5>
        </b-col>
      </b-row>
    </b-card>

    <b-pagination v-if="totalRows > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalRows" />

    <ContainerTransferTable ref="detailsTable" sortBy="createdOn" :sortDescending="true" :getData="getTransferDataChild" v-if="selectedEvent" />
  </div>
</template>

<script>
import ContainerTransferTable from '@/components/tables/ContainerTransferTable'
import { apiPostContainerTransferEventTable, apiPostContainerTransferTable } from '@/plugins/api/container'

import { BIconTable } from 'bootstrap-vue'

export default {
  components: {
    BIconTable,
    ContainerTransferTable
  },
  props: {
    container: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      items: [],
      page: 1,
      perPage: 5,
      totalRows: -1,
      selectedEvent: null
    }
  },
  watch: {
    page: function () {
      this.selectedEvent = null
      this.update()
    },
    container: function () {
      this.update()
    },
    selectedEvent: function () {
      if (this.$refs.detailsTable) {
        this.$refs.detailsTable.update()
        this.$nextTick(() => this.$refs.detailsTable.$el.scrollIntoView({ behavior: 'smooth' }))
      }
    }
  },
  methods: {
    selectEvent: function (event) {
      this.selectedEvent = event
    },
    getTransferDataChild: function (page, limit, prevCount) {
      return apiPostContainerTransferTable({
        page: page,
        limit: limit,
        prevCount: prevCount,
        filter: [{
          column: 'sourceId',
          comparator: 'equals',
          operator: 'or',
          values: [this.selectedEvent.sourceId]
        }, {
          column: 'targetId',
          comparator: 'equals',
          operator: 'and',
          values: [this.selectedEvent.targetId]
        }, {
          column: 'createdOn',
          comparator: 'contains',
          operator: 'and',
          values: [this.selectedEvent.date.substring(0, 10)]
        }, {
          column: 'userId',
          comparator: 'equals',
          operator: 'and',
          values: [this.selectedEvent.userId]
        }]
      })
    },
    update: function () {
      apiPostContainerTransferEventTable({
        page: this.page,
        limit: this.perPage,
        prevCount: this.totalRows,
        filter: [{
          column: 'sourceId',
          comparator: 'equals',
          operator: 'or',
          values: [this.container ? this.container.containerId : null]
        }, {
          column: 'targetId',
          comparator: 'equals',
          operator: 'or',
          values: [this.container ? this.container.containerId : null]
        }],
        orderBy: 'date',
        ascending: 0
      }, result => {
        if (result && result.data) {
          this.items = result.data
          this.totalRows = result.count
        }
      })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style scoped>
.transfer-arrow {
  max-width: 120px;
}
.container-img {
  max-width: 120px;
}
@media (min-width: 768px) {
  .transfer-arrow {
    transform: rotate(-90deg);
  }
}
</style>
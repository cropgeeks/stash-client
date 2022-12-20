<template>
  <div>
    <b-card v-for="event in items" :key="`${event.sourceId}-${event.targetId}-${event.userId}-${event.date}`" class="mb-3">
      <b-row class="d-flex justify-content-between">
        <b-col cols=12 md=4 class="d-flex flex-column align-items-center justify-content-center">
          <template v-if="event.sourceBarcode">
            <b-img fluid class="container-img" :src="require('@/assets/img/container.svg')" />
            <h4>{{ event.sourceBarcode }}</h4>
            <h5><b-badge>{{ event.sourceType }}</b-badge></h5>
          </template>
        </b-col>
        <b-col cols=12 md=4 class="d-flex flex-column align-items-center justify-content-center">
          <b-img class="p-3 transfer-arrow" fluid-grow :src="require('@/assets/img/transfer-arrow.svg')" />
          <div class="d-flex flex-row justify-content-between align-items-center mb-3">
            <b-avatar class="mr-2" :src="`${storeServerUrl}user/${event.userId}/img?imageToken=${storeToken.imageToken}`" />
            <h6 class="p-0 m-0">{{ $t('modalTextContainerHistoryTransferEventCount', { count: event.containerCount, date: new Date(event.date).toLocaleDateString(), name: event.userName }) }}</h6>
          </div>
          <b-button @click="selectEvent(event)"><BIconTable /> {{ $t('buttonShowTable') }}</b-button>
        </b-col>
        <b-col cols=12 md=4 class="d-flex flex-column align-items-center justify-content-center">
          <template v-if="event.targetBarcode">
            <b-img fluid class="container-img" :src="require('@/assets/img/container.svg')" />
            <h4>{{ event.targetBarcode }}</h4>
            <h5><b-badge>{{ event.targetType }}</b-badge></h5>
          </template>
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
import { mapGetters } from 'vuex'

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
    },
    parent: {
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
  computed: {
    ...mapGetters([
      'storeServerUrl',
      'storeToken'
    ])
  },
  watch: {
    page: function () {
      this.selectedEvent = null
      this.update()
    },
    container: function () {
      this.update()
    },
    parent: function () {
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
        filter: this.getFilter(),
        orderBy: 'date',
        ascending: 0
      }, result => {
        if (result && result.data) {
          this.items = result.data
          this.totalRows = result.count
        }
      })
    },
    getFilter: function () {
      if (this.parent) {
        return [{
          column: 'sourceId',
          comparator: 'equals',
          operator: 'or',
          values: [this.parent ? this.parent.containerId : null]
        }, {
          column: 'targetId',
          comparator: 'equals',
          operator: 'or',
          values: [this.parent ? this.parent.containerId : null]
        }]
      } else {
        return [{
          column: 'containerIds',
          comparator: 'arrayContains',
          operator: 'and',
          values: [this.container ? this.container.containerId : null]
        }]
      }
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

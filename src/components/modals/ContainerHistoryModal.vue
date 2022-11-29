<template>
  <b-modal :title="$t('modalTitleContainerHistory')"
           :ok-title="$t('buttonClose')"
           @shown="isShowing = true"
           @hidden="isShowing = false"
           ok-variant="secondary"
           ok-only
           size="xl"
           ref="containerHistoryModal">
    <div v-if="container && container.containerId && isShowing">
      <b-tabs>
        <b-tab :title="$t('tabsContainerHistorySelf')">
          <ContainerTransferTable sortBy="createdOn" :sortDescending="true" :getData="getTransferDataSelf" />
        </b-tab>
        <b-tab :title="$t('tabsContainerHistoryChild')">
          <ContainerTransferTable sortBy="createdOn" :sortDescending="true" :getData="getTransferDataChild" />
        </b-tab>
      </b-tabs>
    </div>
  </b-modal>
</template>

<script>
import ContainerTransferTable from '@/components/tables/ContainerTransferTable'
import { apiPostContainerTransferTable } from '@/plugins/api/container'

export default {
  components: {
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
      isShowing: false
    }
  },
  methods: {
    getTransferDataSelf: function (page, limit, prevCount) {
      return apiPostContainerTransferTable({
        page: page,
        limit: limit,
        prevCount: prevCount,
        filter: [{
          column: 'containerId',
          comparator: 'equals',
          operator: 'and',
          values: [this.container.containerId]
        }]
      })
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
          values: [this.container.containerId]
        }, {
          column: 'targetId',
          comparator: 'equals',
          operator: 'or',
          values: [this.container.containerId]
        }]
      })
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.$nextTick(() => this.$refs.containerHistoryModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.containerHistoryModal.hide())
    }
  }
}
</script>

<style>
</style>

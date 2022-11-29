<template>
  <b-modal :title="$t('modalTitleContainerContent')"
           :ok-title="$t('buttonClose')"
           @shown="isShowing = true"
           @hidden="isShowing = false"
           ok-variant="secondary"
           ok-only
           size="xl"
           ref="containerHistoryModal">
    <div v-if="container && container.containerId && isShowing">
      <ContainerTable :getData="getData" />
    </div>
  </b-modal>
</template>

<script>
import ContainerTable from '@/components/tables/ContainerTable'
import { apiPostContainerTable } from '@/plugins/api/container'

export default {
  components: {
    ContainerTable
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
    getData: function (page, limit, prevCount) {
      return apiPostContainerTable({
        page: page,
        limit: limit,
        prevCount: prevCount,
        filter: [{
          column: 'parentId',
          comparator: 'equals',
          operator: 'and',
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

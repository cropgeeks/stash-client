<template>
  <div>
    <b-table hover striped responsive :fields="transferFields" :items="transfers"  no-local-sorting :sort-by.sync="transferSortBy" :sort-desc.sync="transferSortDescending">
    </b-table>

    <b-pagination v-if="transferTotalRows > transferPerPage"
                  v-model="transferPage"
                  :per-page="transferPerPage"
                  :total-rows="transferTotalRows" />
  </div>
</template>

<script>
export default {
  props: {
    getData: {
      type: Function,
      default: () => {
        return {
          data: {
            data: [],
            count: 0
          }
        }
      }
    },
    sortBy: {
      type: String,
      default: null
    },
    sortDescending: {
      type: Boolean,
      default: null
    }
  },
  data: function () {
    return {
      transfers: [],
      transferPage: 1,
      transferPerPage: 10,
      transferTotalRows: -1,
      transferSortBy: null,
      transferSortDescending: false
    }
  },
  watch: {
    transferPage: function () {
      this.update()
    },
    transferSortBy: function () {
      this.update()
    },
    transferSortDescending: function () {
      this.update()
    }
  },
  computed: {
    transferFields: function () {
      return [{
        key: 'containerBarcode',
        sortable: true,
        label: this.$t('tableColumnTransferLogContainerBarcode')
      }, {
        key: 'containerDescription',
        sortable: true,
        label: this.$t('tableColumnTransferLogContainerDescription'),
        class: 'border-right'
      }, {
        key: 'sourceBarcode',
        sortable: true,
        label: this.$t('tableColumnTransferLogSourceBarcode')
      }, {
        key: 'sourceDescription',
        sortable: true,
        label: this.$t('tableColumnTransferLogSourceDescription'),
        class: 'border-right'
      }, {
        key: 'targetBarcode',
        sortable: true,
        label: this.$t('tableColumnTransferLogTargetBarcode')
      }, {
        key: 'targetDescription',
        sortable: true,
        label: this.$t('tableColumnTransferLogTargetDescription'),
        class: 'border-right'
      }, {
        key: 'userName',
        sortable: true,
        label: this.$t('tableColumnTransferLogUserName')
      }, {
        key: 'createdOn',
        sortable: true,
        label: this.$t('tableColumnTransferLogCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleString() : null
      }]
    }
  },
  methods: {
    update: function () {
      this.getData({
        page: this.transferPage,
        limit: this.transferPerPage,
        prevCount: this.transferTotalRows,
        orderBy: this.transferSortBy,
        ascending: this.transferSortDescending ? 0 : 1
      }).then(result => {
        if (result && result.data) {
          this.transfers = result.data.data
          this.transferTotalRows = result.data.count
        }
      })
    }
  },
  mounted: function () {
    this.transferSortBy = this.sortBy
    this.transferSortDescending = this.sortDescending
    this.update()
  }
}
</script>

<style>

</style>

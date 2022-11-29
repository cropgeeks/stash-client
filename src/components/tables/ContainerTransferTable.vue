<template>
  <div>
    <b-table hover striped responsive :fields="transferFields" :items="transfers" :sort-by="sortBy" :sort-desc="sortDescending">
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
      transferTotalRows: -1
    }
  },
  watch: {
    transferPage: function () {
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
        key: 'userId',
        sortable: true,
        label: this.$t('tableColumnTransferLogUserId')
      }, {
        key: 'createdOn',
        sortable: true,
        label: this.$t('tableColumnTransferLogCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }]
    }
  },
  methods: {
    update: function () {
      this.getData(this.transferPage, this.transferPerPage, this.transferTotalRows)
        .then(result => {
          if (result && result.data) {
            this.transfers = result.data.data
            this.transferTotalRows = result.data.count
          }
        })
    }
  },
  mounted: function () {
    this.update()
  }
}
</script>

<style>

</style>

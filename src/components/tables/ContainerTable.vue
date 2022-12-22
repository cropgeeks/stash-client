<template>
  <div>
    <b-table hover striped responsive :fields="fields" :items="items" no-local-sorting :sort-by.sync="sortBy" :sort-desc.sync="sortDesc">
    </b-table>

    <b-pagination v-if="totalRows > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalRows" />
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
    }
  },
  data: function () {
    return {
      items: [],
      page: 1,
      perPage: 10,
      totalRows: -1,
      sortBy: null,
      sortDescending: null
    }
  },
  watch: {
    page: function () {
      this.update()
    }
  },
  computed: {
    fields: function () {
      return [{
        key: 'containerBarcode',
        sortable: true,
        label: this.$t('tableColumnContainerBarcode')
      }, {
        key: 'containerDescription',
        sortable: true,
        label: this.$t('tableColumnContainerDescription')
      }, {
        key: 'containerTypeName',
        sortable: true,
        label: this.$t('tableColumnContainerType')
      }, {
        key: 'parentBarcode',
        sortable: true,
        label: this.$t('tableColumnContainerParentBarcode')
      }, {
        key: 'parentDescription',
        sortable: true,
        label: this.$t('tableColumnContainerParentDescription')
      }, {
        key: 'containerIsActive',
        sortable: true,
        label: this.$t('tableColumnContainerIsActive')
      }, {
        key: 'projectName',
        sortable: true,
        label: this.$t('tableColumnContainerProjectName')
      }, {
        key: 'trialName',
        sortable: true,
        label: this.$t('tableColumnContainerTrialName')
      }, {
        key: 'createdOn',
        sortable: true,
        label: this.$t('tableColumnContainerCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }]
    }
  },
  methods: {
    update: function () {
      this.getData({
        page: this.page,
        limit: this.perPage,
        prevCount: this.totalRows,
        orderBy: this.sortBy,
        ascending: this.sortDesc ? 0 : 1
      }).then(result => {
        if (result && result.data) {
          this.items = result.data.data
          this.totalRows = result.data.count
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

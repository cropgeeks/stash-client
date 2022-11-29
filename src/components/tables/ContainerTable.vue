<template>
  <div>
    <b-table hover striped responsive :fields="fields" :items="items">
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
      totalRows: -1
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
      this.getData(this.page, this.perPage, this.totalRows)
        .then(result => {
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

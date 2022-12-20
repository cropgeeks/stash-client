<template>
  <div>
    <b-table hover striped responsive :fields="fields" :items="items">
      <template v-slot:cell(stats)="data">
        <Cartesian :width="200" :height="50" :data="getValues(data.item)">
          <Bar animated prop="value" />
          <Tooltip />
        </Cartesian>
      </template>
    </b-table>

    <b-pagination v-if="totalRows > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalRows" />
  </div>
</template>

<script>
import { Cartesian, Bar, Tooltip } from 'laue'

export default {
  components: {
    Cartesian,
    Bar,
    Tooltip
  },
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
      date: null
    }
  },
  watch: {
    page: function () {
      this.update()
    }
  },
  computed: {
    yearMonths: function () {
      if (this.date) {
        const result = [this.date.toISOString().substring(0, 7)]
        for (let i = 1; i < 12; i++) {
          this.date.setMonth(this.date.getMonth() - 1)
          result.unshift(this.date.toISOString().substring(0, 7))
        }

        return result
      } else {
        return []
      }
    },
    fields: function () {
      return [{
        key: 'name',
        sortable: true,
        label: this.$t('tableColumnUserName')
      }, {
        key: 'emailAddress',
        sortable: true,
        label: this.$t('tableColumnUserEmailAddress')
      }, {
        key: 'userType',
        sortable: true,
        label: this.$t('tableColumnUserType')
      }, {
        key: 'stats',
        sortable: false,
        label: this.$t('tableColumnUserStats')
      }, {
        key: 'createdOn',
        sortable: true,
        label: this.$t('tableColumnUserCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }]
    }
  },
  methods: {
    getValues: function (userStats) {
      const result = this.yearMonths.map(ym => {
        if (userStats.stats[ym]) {
          return { value: userStats.stats[ym], name: ym }
        } else {
          return { value: 0, name: ym }
        }
      })

      console.log(userStats, result)

      return result
    },
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

    this.date = new Date()
  }
}
</script>

<style>

</style>

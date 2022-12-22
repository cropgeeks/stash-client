<template>
  <b-card no-body class="overflow-hidden" v-if="user">
    <b-row no-gutters>
      <b-col md="4">
        <CustomAvatar class="m-3" :user="user" size="8em" />
      </b-col>
      <b-col md="8">
        <b-card-body>
          <b-card-title><span class="d-block">{{ user.name }}</span> <b-badge :variant="userTypes[user.userType].variant">{{ userTypes[user.userType].text }}</b-badge></b-card-title>
          <b-card-text class="text-muted mb-0" v-if="user.emailAddress">{{ user.emailAddress }}</b-card-text>

          <Cartesian :width="200" :height="50" :data="getValues()" v-if="user.stats">
            <Area animated prop="value" />
            <Tooltip />
          </Cartesian>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
import CustomAvatar from '@/components/CustomAvatar'
import { mapGetters } from 'vuex'
import { Cartesian, Area, Tooltip } from 'laue'

export default {
  components: {
    Cartesian,
    Area,
    Tooltip,
    CustomAvatar
  },
  props: {
    user: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      date: null
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeServerUrl'
    ]),
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
    userTypes: function () {
      return {
        admin: {
          text: this.$t('typesUserAdmin'),
          variant: 'success'
        },
        regular: {
          text: this.$t('typesUserRegular'),
          variant: 'info'
        },
        reference: {
          text: this.$t('typesUserReference'),
          variant: 'warning'
        },
        inactive: {
          text: this.$t('typesUserInactive'),
          variant: 'danger'
        }
      }
    }
  },
  methods: {
    getValues: function () {
      const result = this.yearMonths.map(ym => {
        if (this.user.stats[ym]) {
          return { value: this.user.stats[ym], name: ym }
        } else {
          return { value: 0, name: ym }
        }
      })

      return result
    }
  },
  mounted: function () {
    this.date = new Date()
  }
}
</script>

<style>

</style>

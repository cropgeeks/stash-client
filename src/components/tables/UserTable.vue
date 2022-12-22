<template>
  <div>
    <b-table hover striped responsive :fields="fields" :items="items" no-local-sorting :sort-by.sync="sortBy" :sort-desc.sync="sortDesc">
      <template v-slot:cell(stats)="data">
        <Cartesian :width="200" :height="50" :data="getValues(data.item)">
          <Area animated prop="value" />
          <Tooltip />
        </Cartesian>
      </template>

      <template v-slot:cell(icon)="data">
        <CustomAvatar :user="data.item" :searchParams="{ timestamp: apiCallTimestamp }" />
      </template>

      <template v-slot:cell(userType)="data">
        <b-badge :variant="userTypes[data.item.userType].variant">{{ userTypes[data.item.userType].text }}</b-badge>
      </template>

      <template v-slot:cell(actions)="data">
        <b-button-group>
          <b-button size="sm" @click="editUser(data.item)"><BIconPencilSquare /></b-button>
          <b-button size="sm" @click="pickImage(data.item)"><BIconImage /></b-button>
        </b-button-group>
      </template>
    </b-table>

    <b-pagination v-if="totalRows > perPage"
                  v-model="page"
                  :per-page="perPage"
                  :total-rows="totalRows" />

    <AddEditUserModal :userToEdit="selectedUser" ref="userModal" @change="update" />
    <UserImageUploadModal :user="selectedUser" ref="userImageModal" @change="update(true)" />

    <b-button variant="primary" @click="addUser"><BIconPersonPlus /> {{ $t('buttonAddUser') }}</b-button>
  </div>
</template>

<script>
import CustomAvatar from '@/components/CustomAvatar'
import AddEditUserModal from '@/components/modals/AddEditUserModal'
import UserImageUploadModal from '@/components/modals/UserImageUploadModal'

import { Cartesian, Area, Tooltip } from 'laue'
import { BIconPencilSquare, BIconPersonPlus, BIconImage } from 'bootstrap-vue'

export default {
  components: {
    AddEditUserModal,
    BIconPencilSquare,
    BIconPersonPlus,
    BIconImage,
    CustomAvatar,
    Cartesian,
    Area,
    Tooltip,
    UserImageUploadModal
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
      sortBy: null,
      sortDesc: false,
      date: null,
      selectedUser: null,
      apiCallTimestamp: null
    }
  },
  watch: {
    page: function () {
      this.update()
    },
    sortBy: function () {
      this.update()
    },
    sortDesc: function () {
      this.update()
    }
  },
  computed: {
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
    },
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
        key: 'icon',
        sortable: false,
        label: this.$t('tableColumnUserIcon')
      }, {
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
        key: 'lastLogin',
        sortable: true,
        label: this.$t('tableColumnUserLastLogin'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }, {
        key: 'createdOn',
        sortable: true,
        label: this.$t('tableColumnUserCreatedOn'),
        formatter: value => value ? new Date(value).toLocaleDateString() : null
      }, {
        key: 'actions',
        sortable: false,
        label: this.$t('tableColumnUserActions')
      }]
    }
  },
  methods: {
    pickImage: function (user) {
      this.selectedUser = user
      this.$nextTick(() => this.$refs.userImageModal.show())
    },
    editUser: function (user) {
      this.selectedUser = user
      this.$nextTick(() => this.$refs.userModal.show())
    },
    addUser: function () {
      this.selectedUser = null
      this.$nextTick(() => this.$refs.userModal.show())
    },
    getValues: function (userStats) {
      const result = this.yearMonths.map(ym => {
        if (userStats.stats[ym]) {
          return { value: userStats.stats[ym], name: ym }
        } else {
          return { value: 0, name: ym }
        }
      })

      return result
    },
    update: function (force = false) {
      this.selectedUser = null
      this.getData({
        page: this.page,
        limit: this.perPage,
        prevCount: this.totalRows,
        orderBy: this.sortBy,
        ascending: this.sortDesc ? 0 : 1
      })
        .then(result => {
          if (force) {
            this.apiCallTimestamp = Date.now()
          }
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

<template>
  <b-modal :ok-title="$t('buttonAdd')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddTrial')"
           @ok.prevent="onSubmit"
           ref="addTrialModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelAddTrialName')" label-for="name">
        <b-form-input id="name" v-model="name" required :state="formState.name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddTrialDescription')" label-for="description">
        <b-form-textarea :rows="3" id="description" v-model="description" :state="formState.description" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddTrialUser')" label-for="user">
        <b-form-select :options="userOptions" id="user" v-model="user" :state="formState.user" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddTrialStartDate')" label-for="startDate">
        <b-form-input id="startDate" type="date" v-model="startDate" :state="formState.startDate" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddTrialEndDate')" label-for="endDate">
        <b-form-input id="endDate" type="date" v-model="endDate" :state="formState.endDate" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostTrial } from '@/plugins/api/trial'
import { apiPostUserTable } from '@/plugins/api/user'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
export default {
  props: {
    projectId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      name: null,
      description: null,
      startDate: null,
      endDate: null,
      user: null,
      users: [],
      formValidated: null,
      formState: {
        name: null,
        description: null,
        startDate: null,
        endDate: null
      }
    }
  },
  computed: {
    userOptions: function () {
      if (this.users) {
        return this.users.map(u => {
          return {
            value: u,
            text: `${u.name} (${u.userType})`
          }
        })
      } else {
        return []
      }
    }
  },
  methods: {
    onSubmit: function () {
      this.formValidated = true

      const state = {
        name: this.name !== null && this.name.length > 0 && this.name.length < 255,
        description: true,
        startDate: true,
        endDate: true,
        user: this.user !== undefined && this.user !== null
      }

      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate)
        const end = new Date(this.endDate)

        state.startDate = start <= end
        state.endDate = start <= end
      }

      this.formState = state

      if (Object.keys(state).filter(st => !state[st]).length === 0) {
        apiPostTrial({
          name: this.name,
          description: this.description,
          startDate: this.startDate ? new Date(this.startDate) : null,
          endDate: this.endDate ? new Date(this.endDate) : null,
          projectId: this.projectId,
          userId: this.user ? this.user.id : null
        }, newTrial => {
          this.$emit('trial-added', newTrial)
          this.hide()
        })
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.name = null
      this.description = null
      this.startDate = null
      this.endDate = null
      this.user = null
      this.users = []
      this.formValidated = null
      this.formState = {
        name: null,
        description: null,
        startDate: null,
        endDate: null,
        user: null
      }
      this.$nextTick(() => this.$refs.addTrialModal.show())

      apiPostUserTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'name',
        ascending: 1
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.users = result.data

          if (result && result.data.length > 0) {
            this.user = result.data[0]
          } else {
            this.user = null
          }
        } else {
          this.users = []
          this.user = null
        }
      })
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addTrialModal.hide())
    }
  }
}
</script>

<style>
</style>

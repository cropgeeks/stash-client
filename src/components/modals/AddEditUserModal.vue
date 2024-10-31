<template>
  <b-modal :ok-title="$t('buttonSave')"
           :cancel-title="$t('buttonCancel')"
           :title="isEdit ? $t('modalTitleEditUser') : $t('modalTitleAddUser')"
           size="md"
           @ok.prevent="onSubmit"
           ref="addEditUserModal">
    <UserCard class="mb-4" :user="tempUser" />
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelUserName')" label-for="username">
        <b-form-input id="username" v-model="name" :state="formState.name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelUserEmail')" label-for="email">
        <b-form-input id="email" type="email" v-model="email" :disabled="isEdit" :state="formState.email" />
      </b-form-group>
      <b-form-group :label="$t('formLabelUserPassword')" label-for="password">
        <b-form-input id="password" type="password" v-model="password" :disabled="isEdit || (userType === 'reference')" :state="formState.password" />
      </b-form-group>
      <b-form-group :label="$t('formLabelUserType')" label-for="userType">
        <b-form-select id="userType" :options="userTypes" v-model="userType" :state="formState.userType" />
      </b-form-group>

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>
  </b-modal>
</template>

<script>
import UserCard from '@/components/UserCard'
import { apiPatchUser, apiPostUser } from '@/plugins/api/user'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    UserCard
  },
  props: {
    userToEdit: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      name: null,
      email: null,
      userType: 'regular',
      icon: null,
      password: null,
      formState: {
        name: null,
        email: null,
        userType: null,
        password: null
      },
      errorMessage: null
    }
  },
  watch: {
    userType: function (newValue) {
      if (newValue === 'reference') {
        this.password = null
      }
    }
  },
  computed: {
    tempUser: function () {
      return {
        id: this.userToEdit ? this.userToEdit.id : null,
        name: this.name,
        emailAddress: this.email,
        userType: this.userType,
        stats: this.userToEdit ? this.userToEdit.stats : null
      }
    },
    isEdit: function () {
      return this.userToEdit !== null
    },
    userTypes: function () {
      return [{
        text: this.$t('typesUserAdmin'),
        value: 'admin'
      },
      {
        text: this.$t('typesUserRegular'),
        value: 'regular'
      },
      {
        text: this.$t('typesUserReference'),
        value: 'reference'
      },
      {
        text: this.$t('typesUserInactive'),
        value: 'inactive'
      }]
    }
  },
  methods: {
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        name: this.name !== null && this.name.length > 0 && this.name.length < 255,
        email: this.isEdit ? true : (this.email !== null && this.email.length > 0 && this.email.length < 255),
        password: (this.isEdit || this.userType === 'reference') ? true : (this.password !== null && this.password.length > 0),
        userType: this.userType !== null
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        emitter.emit('show-loading', true)

        const resultHandler = () => {
          emitter.emit('show-loading', false)
          this.$emit('change')
          this.hide()
        }

        const errorHandler = {
          codes: [400, 404, 409],
          callback: e => {
            emitter.emit('show-loading', false)

            switch (e.status) {
              case 400:
                this.errorMessage = 'formErrorUserMissingParameter'
                break
              case 404:
                this.errorMessage = 'formErrorUserNotFound'
                break
              case 409:
                this.errorMessage = 'formErrorUserEmailConflict'
                break
            }
          }
        }

        if (this.isEdit) {
          apiPatchUser({
            id: this.userToEdit.id,
            name: this.name,
            emailAddress: this.email,
            userType: this.userType
          }, resultHandler, errorHandler)
        } else {
          apiPostUser({
            name: this.name,
            emailAddress: this.email,
            password: this.password,
            userType: this.userType
          }, resultHandler, errorHandler)
        }
      }
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      if (this.userToEdit) {
        this.name = this.userToEdit.name
        this.email = this.userToEdit.emailAddress
        this.userType = this.userToEdit.userType
        this.icon = null
        this.password = null
      } else {
        this.name = null
        this.email = null
        this.userType = 'regular'
        this.icon = null
        this.password = null
      }
      this.errorMessage = null
      this.formValidated = null
      this.formState = {
        name: null,
        email: null,
        userType: null,
        password: null
      }
      this.$nextTick(() => this.$refs.addEditUserModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addEditUserModal.hide())
    }
  }
}
</script>

<style>
</style>

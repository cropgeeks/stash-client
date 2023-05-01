<template>
  <b-modal :ok-title="$t('buttonUpdate')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleChangePassword')"
           @hidden="reset"
           @ok.prevent="onSubmit"
           ref="changePasswordModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelChangePasswordOldPassword')" label-for="oldPassword">
        <b-form-input id="oldPassword" type="password" v-model="oldPassword" required :state="formState.oldPassword" />
      </b-form-group>
      <b-form-group :label="$t('formLabelChangePasswordNewPassword')" label-for="newPassword">
        <b-form-input id="newPassword" type="password" v-model="newPassword" :state="formState.newPassword" />
      </b-form-group>
      <b-form-group :label="$t('formLabelChangePasswordNewPasswordConfirm')" label-for="user">
        <b-form-input id="newPasswordConfirm" type="password" v-model="newPasswordConfirm" :state="formState.newPasswordConfirm" />
      </b-form-group>
    </b-form>

    <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
  </b-modal>
</template>

<script>
import { apiPatchUserPassword } from '@/plugins/api/user'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    projectId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      oldPassword: null,
      newPassword: null,
      newPasswordConfirm: null,
      errorMessage: null,
      formValidated: null,
      formState: {
        oldPassword: null,
        newPassword: null,
        newPasswordConfirm: null
      }
    }
  },
  computed: {
    newPasswordsSame: function () {
      if (this.newPassword && this.newPasswordConfirm) {
        return this.newPassword === this.newPasswordConfirm
      } else {
        return false
      }
    }
  },
  methods: {
    onSubmit: function () {
      this.formValidated = true

      const state = {
        oldPassword: this.oldPassword !== undefined && this.oldPassword !== null && this.oldPassword !== '',
        newPassword: this.newPassword !== undefined && this.newPassword !== null && this.newPassword !== '' && this.newPasswordsSame,
        newPasswordConfirm: this.newPasswordConfirm !== undefined && this.newPasswordConfirm !== null && this.newPasswordConfirm !== '' && this.newPasswordsSame
      }

      this.formState = state

      if (!state.oldPassword) {
        this.errorMessage = 'formErrorMissingOldPassword'
      } else if (!state.newPassword) {
        this.errorMessage = 'formErrorMissingNewPassword'
      } else if (!state.newPasswordConfirm) {
        this.errorMessage = 'formErrorMissingNewPasswordConfirm'
      } else if (!this.newPasswordsSame) {
        this.errorMessage = 'formErrorMissingNewPasswordsMismatch'
      }

      if (Object.keys(state).filter(st => !state[st]).length === 0) {
        emitter.emit('show-loading', true)

        apiPatchUserPassword({
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        }, () => {
          this.hide()
          this.$store.commit('ON_TOKEN_CHANGED', null)
          this.$router.push({ name: 'login' })
          emitter.emit('show-loading', false)
        }, {
          codes: [400, 401, 403, 404],
          callback: e => {
            emitter.emit('show-loading', false)

            switch (e.status) {
              case 400:
                this.errorMessage = 'formErrorPasswordUpdateMissingParameter'
                break
              case 401:
                this.errorMessage = 'formErrorPasswordUpdateInvalidParameters'
                break
              case 403:
                this.errorMessage = 'formErrorPasswordUpdateInvalidAccess'
                break
              case 404:
                this.errorMessage = 'formErrorPasswordUpdateUserNotFound'
            }
          }
        })
      }
    },
    reset: function () {
      this.oldPassword = null
      this.newPassword = null
      this.newPasswordConfirm = null

      this.formState = {
        oldPassword: null,
        newPassword: null,
        newPasswordConfirm: null
      }

      this.formValidated = null
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.reset()
      this.$nextTick(() => this.$refs.changePasswordModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.changePasswordModal.hide())
    }
  }
}
</script>

<style>
</style>

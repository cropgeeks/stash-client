<template>
  <div>
    <b-form class="form-signin" @submit.prevent="login">
      <div class="text-center">
        <img class="mb-4" :src="require('@/assets/img/stash.svg')" alt="Stash logo" width="72" height="72">
        <h3 class="mb-3 font-weight-normal">{{ $t('pageLoginTitle') }}</h3>
      </div>
      <b-form-group :label="$t('formLabelLoginEmail')" label-for="email">
        <b-form-input type="email" id="email" v-model="email" required />
      </b-form-group>
      <b-form-group :label="$t('formLabelLoginPassword')" label-for="password">
        <b-form-input type="password" id="password" v-model="password" required />
      </b-form-group>
      <b-button size="lg" variant="primary" block type="submit">{{ $t('buttonSignIn') }}</b-button>
    </b-form>
  </div>
</template>

<script>
import { apiPostToken } from '@/plugins/api/auth'

const emitter = require('tiny-emitter/instance')

export default {
  data: function () {
    return {
      email: null,
      password: null
    }
  },
  methods: {
    login: function () {
      emitter.emit('show-loading', true)
      apiPostToken({
        username: this.email,
        password: this.password
      }, result => {
        emitter.emit('show-loading', false)
        // Do this here as well
        this.$store.commit('ON_TOKEN_CHANGED', result)

        // Otherwise, just go to home
        this.$router.push({ name: 'home' })
      }, {
        codes: [400, 401, 500],
        callback: e => {
          emitter.emit('show-loading', false)
          switch (e.status) {
            case 400:
              // Bad request, some parameter is missing
              this.error = {
                text: 'toastErrorMissingParameter',
                variant: 'text-danger'
              }
              break
            case 403:
              // Bad credentials
              this.error = {
                text: 'toastErrorInvalidUsernamePassword',
                variant: 'text-danger'
              }
              break
            case 500:
              // Server error
              this.error = {
                text: 'toastErrorServer500',
                variant: 'text-danger'
              }
              break
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.form-signin {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
}
</style>

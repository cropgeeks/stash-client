<template>
  <v-form @submit.prevent="login">

    <div class="text-h4 text-medium-emphasis">{{ $t('widgetSignInTitle') }}</div>
    <div class="text-subtitle-1 text-medium-emphasis">{{ $t('widgetSignInText') }}</div>

    <v-text-field
      :label="$t('formLabelUserEmail')"
      :prepend-inner-icon="mdiEmailOutline"
      autofocus
      :readonly="loading"
      v-model="username"
    />

    <v-text-field
      :append-inner-icon="visible ? mdiEyeOff : mdiEye"
      :type="visible ? 'text' : 'password'"
      :label="$t('formLabelUserPassword')"
      v-model="password"
      :prepend-inner-icon="mdiLockOutline"
      :readonly="loading"
      @click:append-inner="visible = !visible"
    />

    <v-card
      v-if="error"
      class="mb-4"
      color="red-darken-1"
    >
      <v-card-text class="text-caption text-white">
        {{ error }}
      </v-card-text>
    </v-card>

    <v-btn
      block
      type="submit"
      :disabled="!valid || loading"
      class="mb-8"
      :prepend-icon="mdiLoginVariant"
      color="primary"
      size="large"
    >
      {{ $t('buttonSignIn') }}
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
  import { apiPostToken } from '@/plugins/api/auth'
  import type { Token } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'
  import { mdiEmailOutline, mdiEye, mdiEyeOff, mdiLockOutline, mdiLoginVariant } from '@mdi/js'
  import type { AxiosResponse } from 'axios'
  import { useI18n } from 'vue-i18n'

  const visible = ref(false)
  const username = ref('')
  const password = ref('')
  const loading = defineModel<boolean>('loading')
  const error = ref()

  const store = coreStore()
  const router = useRouter()
  const { t } = useI18n()

  const valid = computed(() => {
    return username.value && username.value.trim() !== '' && password.value && password.value.trim() !== ''
  })

  const emit = defineEmits(['close'])

  function login () {
    apiPostToken({
      username: username.value,
      password: password.value,
    }, (result: Token) => {
      loading.value = false

      store.setToken(result)

      router.push('/')

      username.value = ''
      password.value = ''
      error.value = null

      emit('close')
    }, {
      codes: [403, 503],
      callback: (e: AxiosResponse) => {
        loading.value = false
        switch (e.status) {
          case 403: {
            error.value = t('errorLoginFourOThree')
            break
          }
          case 504: {
            error.value = t('errorLoginFiveOThree')
            break
          }
        }
      },
    })
  }
</script>

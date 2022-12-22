<template>
  <b-modal :ok-title="$t('buttonUpload')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleUploadUserImage')"
           @ok.prevent="onSubmit"
           ref="userImageUploadModal">
    <b-form @submit.prevent="onSubmit">
      <!-- Preview the image -->
      <b-img fluid-grow rounded :src="imageData" class="image" v-if="imageData" />
      <!-- Input for selecting (or taking) the image -->
      <b-form-file v-model="imageFile" accept="image/png, image/jpeg" class="file-selector" ref="imageInput" />

      <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostUserImage } from '@/plugins/api/user'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    user: {
      type: Object,
      default: () => null
    }
  },
  data: function () {
    return {
      imageFile: null,
      imageData: null,
      errorMessage: null
    }
  },
  watch: {
    imageFile: async function (newValue) {
      if (newValue) {
        // Convert to base64 for displaying
        this.imageData = await this.toBase64(newValue)
      } else {
        this.imageData = null
      }
    }
  },
  methods: {
    /**
     * Converts the user selected file into base64
     * @param file The image file
     */
    toBase64: function (file) {
      // Return a promise as we can't wait for this
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    onSubmit: function () {
      const formData = new FormData()
      formData.append('image', this.imageFile)

      emitter.emit('show-loading', true)

      apiPostUserImage(this.user.id, formData, result => {
        emitter.emit('show-loading', false)
        this.$emit('change')
        this.hide()
      }, {
        codes: [400, 404, 413],
        callback: e => {
          emitter.emit('show-loading', false)

          switch (e.status) {
            case 400:
              this.errorMessage = 'formErrorUserMissingParameter'
              break
            case 404:
              this.errorMessage = 'formErrorUserNotFound'
              break
            case 413:
              this.errorMessage = 'formErrorUserImageTooBig'
              break
          }
        }
      })
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.imageFile = null
      this.imageData = null
      this.errorMessage = null
      this.$nextTick(() => this.$refs.userImageUploadModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.userImageUploadModal.hide())
    }
  }
}
</script>

<style>
</style>

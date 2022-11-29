<template>
  <b-modal :ok-title="$t('buttonAdd')"
           :title="$t('modalTitleAddContainerTypes')"
           @ok.prevent="onSubmit"
           ref="addContainerTypesModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelAddContainerTypesName')" label-for="name">
        <b-form-input id="name" v-model="name" required :state="formState.name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddContainerTypesDescription')" label-for="description">
        <b-form-textarea :rows="3" id="description" v-model="description" :state="formState.description" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostContainerType } from '@/plugins/api/container'

export default {
  data: function () {
    return {
      name: null,
      description: null,
      formValidated: null,
      formState: {
        name: null,
        description: null
      }
    }
  },
  methods: {
    onSubmit: function () {
      this.formValidated = true

      this.formState = {
        name: this.name !== null && this.name.length > 0 && this.name.length < 255,
        description: true
      }

      if (Object.keys(this.formState).filter(st => !this.formState[st]).length === 0) {
        apiPostContainerType({
          name: this.name,
          description: this.description
        }, newContainer => {
          this.$emit('container-type-added', newContainer)
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
      this.formValidated = null
      this.formState = {
        name: null,
        description: null
      }
      this.$nextTick(() => this.$refs.addContainerTypesModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addContainerTypesModal.hide())
    }
  }
}
</script>

<style>
</style>

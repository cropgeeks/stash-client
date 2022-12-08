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
      <b-form-group :label="$t('formLabelAddContainerTypesIcon')" label-for="icon">
        <b-row>
          <b-col cols=8>
            <b-form-textarea :rows="3" :placeholder="$t('formPlaceholderAddContainerTypesIcon')" id="icon" v-model="icon" class="h-100" />
          </b-col>
          <b-col cols=4>
            <div class="border w-100 h-100">
              <div v-html="icon" v-if="icon" class="svg-image" />
            </div>
          </b-col>
        </b-row>
        <b-form-file type="file" accept="image/svg+xml" v-model="iconFile" />
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
      icon: null,
      iconFile: null,
      formValidated: null,
      formState: {
        name: null,
        description: null
      }
    }
  },
  watch: {
    iconFile: function (newValue) {
      if (newValue) {
        const reader = new FileReader()
        reader.onload = event => {
          this.icon = event.target.result
          this.iconFile = null
        }
        reader.readAsText(newValue)
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
          description: this.description,
          icon: this.icon
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
      this.icon = null
      this.iconFile = null
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
.svg-image svg {
  max-width: 100%;
  height: auto;
}
</style>

<template>
  <b-modal :ok-title="$t('buttonAdd')"
           :cancel-title="$t('buttonCancel')"
           :title="$t('modalTitleAddProject')"
           @ok.prevent="onSubmit"
           ref="addProjectModal">
    <b-form @submit.prevent="onSubmit" novalidate>
      <b-form-group :label="$t('formLabelAddProjectName')" label-for="name">
        <b-form-input id="name" v-model="name" required :state="formState.name" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddProjectDescription')" label-for="description">
        <b-form-textarea :rows="3" id="description" v-model="description" :state="formState.description" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddProjectStartDate')" label-for="startDate">
        <b-form-input id="startDate" type="date" v-model="startDate" :state="formState.startDate" />
      </b-form-group>
      <b-form-group :label="$t('formLabelAddProjectEndDate')" label-for="endDate">
        <b-form-input id="endDate" type="date" v-model="endDate" :state="formState.endDate" />
      </b-form-group>
    </b-form>
  </b-modal>
</template>

<script>
import { apiPostProject } from '@/plugins/api/project'
export default {
  data: function () {
    return {
      name: null,
      description: null,
      startDate: null,
      endDate: null,
      formValidated: null,
      formState: {
        name: null,
        description: null,
        startDate: null,
        endDate: null
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
        endDate: true
      }

      if (this.startDate && this.endDate) {
        const start = new Date(this.startDate)
        const end = new Date(this.endDate)

        state.startDate = start <= end
        state.endDate = start <= end
      }

      this.formState = state

      if (Object.keys(state).filter(st => !state[st]).length === 0) {
        apiPostProject({
          name: this.name,
          description: this.description,
          startDate: this.startDate ? new Date(this.startDate) : null,
          endDate: this.endDate ? new Date(this.endDate) : null
        }, newProject => {
          this.$emit('project-added', newProject)
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
      this.formValidated = null
      this.formState = {
        name: null,
        description: null,
        startDate: null,
        endDate: null
      }
      this.$nextTick(() => this.$refs.addProjectModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.addProjectModal.hide())
    }
  }
}
</script>

<style>
</style>

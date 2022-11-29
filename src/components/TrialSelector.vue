<template>
  <div>
    <b-form-group :label="$t('formLabelImportTrial')" :description="$t('formDescriptionImportTrial')" label-for="trial">
      <b-input-group>
        <b-form-select :options="trials" v-model="selectedTrial" id="trial" />
        <b-input-group-addon>
          <b-button @click="$refs.addTrialModal.show()"><BIconPlusSquare /></b-button>
        </b-input-group-addon>
      </b-input-group>
    </b-form-group>

    <AddTrialModal ref="addTrialModal" @trial-added="getTrials" :projectId="projectId" />
  </div>
</template>

<script>
import AddTrialModal from '@/components/modals/AddTrialModal'
import { apiPostTrialTable } from '@/plugins/api/trial'
import { BIconPlusSquare } from 'bootstrap-vue'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

export default {
  components: {
    AddTrialModal,
    BIconPlusSquare
  },
  props: {
    projectId: {
      type: Number,
      default: null
    }
  },
  data: function () {
    return {
      trials: [],
      selectedTrial: null
    }
  },
  watch: {
    selectedTrial: function (newValue) {
      this.$emit('trial-selected', newValue)
    },
    projectId: function () {
      this.getTrials()
    }
  },
  methods: {
    getTrials: function (newProject) {
      apiPostTrialTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        sortBy: 'name',
        ascending: 1,
        filter: [{
          column: 'projectId',
          comparator: 'equals',
          operator: 'and',
          values: [this.projectId]
        }]
      }, result => {
        if (result && result.data) {
          this.trials = result.data.map(t => {
            let name = t.name

            if (t.startDate || t.endDate) {
              const dates = [t.startDate, t.endDate].map(d => d ? new Date(d).toLocaleDateString() : 'N/A')

              name += ` (${dates.join(' - ')})`
            }

            return {
              text: name,
              value: t
            }
          })

          if (result.data.length > 0) {
            if (newProject) {
              this.selectedTrial = result.data.find(p => p.id === newProject.id)
            } else {
              this.selectedTrial = result.data[0]
            }
          } else {
            this.selectedTrial = null
          }
        } else {
          this.trials = []
          this.selectedTrial = null
        }
      })
    }
  },
  mounted: function () {
    this.getTrials()
  }
}
</script>

<style>

</style>

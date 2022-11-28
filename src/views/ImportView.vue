<template>
  <div>
    <h1>{{ $t('pageImportTitle') }}</h1>
    <p v-html="$t('pageImportText')" />

    <b-form @submit.prevent>
      <b-row>
        <b-col cols=12 md=6>
          <ContainerSearch label="formLabelImportInto" description="formDescriptionImportInto" :tabIndex="1" autofocus @container-selected="setContainer" />
        </b-col>
        <b-col cols=12 md=6>
          <b-form-group :label="$t('formLabelImportContainerType')" :description="$t('formDescriptionImportContainerType')" label-for="container-type">
            <b-form-select :options="containerTypes" v-model="selectedContainerType" id="container-type" />
          </b-form-group>
          <b-form-group :label="$t('formLabelImportProject')" :description="$t('formDescriptionImportProject')" label-for="project">
            <b-form-select :options="projects" v-model="selectedProject" id="project" />
          </b-form-group>
          <b-form-group :label="$t('formLabelImportTrial')" :description="$t('formDescriptionImportTrial')" label-for="trial">
            <b-form-select :options="trials" v-model="selectedTrial" id="trial" />
          </b-form-group>
        </b-col>
      </b-row>

      <div class="mt-3" v-if="targetContainer">
        <h2>{{ $t('pageImportContainerTableTitle') }}</h2>
        <p>{{ $t('pageImportContainerTableText') }}</p>

        <ContainerSearch ref="itemSearch" :showPreview="false" label="formLabelImportItem" description="formDescriptionImportItem" :tabIndex="2" @container-selected="addItem" />

        <b-table :items="items" :fields="itemColumns" v-if="items && items.length > 0">
          <template v-slot:cell(containerDescription)="data">
            <span v-if="data.item.containerId">{{ data.item.containerDescription }}</span>
            <b-form-input :value="data.item.containerDescription" @change="updateDescription($event, data.index)" v-else />
          </template>
          <template v-slot:cell(containerTypeName)="data">
            <b-badge>{{ data.item.containerTypeName }}</b-badge>
          </template>
          <template v-slot:cell(actions)="data">
            <b-button variant="danger" @click="deleteItem(data.index)"><BIconX /></b-button>
          </template>
        </b-table>
      </div>

      <b-button @click="onSubmit"><BIconUpload /> {{ $t('buttonUpload') }}</b-button>
    </b-form>
  </div>
</template>

<script>
import ContainerSearch from '@/components/ContainerSearch'
import { apiPostContainerImport, apiPostContainerTypeTable } from '@/plugins/api/container'
import { apiPostProjectTable } from '@/plugins/api/project'
import { apiPostTrialTable } from '@/plugins/api/trial'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
import { BIconX, BIconUpload } from 'bootstrap-vue'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconX,
    BIconUpload,
    ContainerSearch
  },
  data: function () {
    return {
      targetContainer: null,
      containerTypes: [],
      selectedContainerType: null,
      items: [],
      projects: [],
      selectedProject: null,
      trials: [],
      selectedTrial: null
    }
  },
  computed: {
    itemColumns: function () {
      return [{
        key: 'containerBarcode',
        sortable: true,
        label: this.$t('tableColumnImportContainerBarcode')
      }, {
        key: 'containerDescription',
        sortable: true,
        label: this.$t('tableColumnImportContainerDescription')
      }, {
        key: 'containerTypeName',
        sortable: true,
        label: this.$t('tableColumnImportContainerType')
      }, {
        key: 'actions',
        label: ''
      }]
    }
  },
  watch: {
    selectedProject: function () {
      this.getTrials()
    }
  },
  methods: {
    onSubmit: function () {
      apiPostContainerImport({
        parentContainerId: this.targetContainer.containerId,
        items: this.items
      }, result => {
        console.log(result)
      }, {
        codes: [400, 404],
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
            case 404:
              // Bad request, some parameter is missing
              this.error = {
                text: 'toastErrorIncompatibleContainerTypes',
                variant: 'text-danger'
              }
              break
          }
        }
      })
    },
    deleteItem: function (index) {
      // TODO: Ask for confirmation first
      this.items.splice(index, 1)
    },
    updateDescription: function (event, index) {
      this.items[index].containerDescription = event
    },
    setContainer: function (container) {
      if (container.containerId) {
        this.targetContainer = container
        this.items = []
      }
    },
    addItem: function (item) {
      if (item !== undefined && item !== null) {
        if (item.containerTypeId && item.containerTypeId !== this.selectedContainerType.id) {
          emitter.emit('speak', this.$t('ttsNotificationIncompatibleContainerType'))
          this.$refs.itemSearch.reset()
        } else {
          item.projectId = this.selectedProject ? this.selectedProject.id : null
          item.trialId = this.selectedTrial ? this.selectedTrial.id : null
          item.containerTypeId = this.selectedContainerType.id
          item.containerTypeName = this.selectedContainerType.name
          if (!this.items.find(i => i.containerBarcode === item.containerBarcode)) {
            this.items.push(item)
            this.$refs.itemSearch.reset()
          } else {
            emitter.emit('speak', this.$t('ttsNotificationDuplicateContainer'))
            this.$refs.itemSearch.reset()
          }
        }
      }
    },
    getContainerTypes: function () {
      apiPostContainerTypeTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'name',
        ascending: 1
      }, result => {
        if (result && result.data) {
          this.containerTypes = result.data.map(t => {
            return {
              text: t.name,
              value: t
            }
          })

          if (result.data.length > 0) {
            this.selectedContainerType = result.data[0]
          }
        } else {
          this.containerTypes = []
        }
      })
    },
    getTrials: function () {
      apiPostTrialTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        sortBy: 'name',
        ascending: 1,
        filter: [{
          column: 'projectId',
          comparator: 'equals',
          operator: 'and',
          values: [this.selectedProject.id]
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
            this.selectedTrial = result.data[0]
          } else {
            this.selectedTrial = null
          }
        } else {
          this.trials = []
          this.selectedTrial = null
        }
      })
    },
    getProjects: function () {
      apiPostProjectTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        sortBy: 'name',
        ascending: 1
      }, result => {
        if (result && result.data) {
          this.projects = result.data.map(p => {
            let name = p.name

            if (p.startDate || p.endDate) {
              const dates = [p.startDate, p.endDate].map(d => d ? new Date(d).toLocaleDateString() : 'N/A')

              name += ` (${dates.join(' - ')})`
            }

            return {
              text: name,
              value: p
            }
          })

          if (result.data.length > 0) {
            this.selectedProject = result.data[0]
          } else {
            this.selectedProject = null
          }
        } else {
          this.projects = []
          this.selectedProject = null
        }
      })
    }
  },
  mounted: function () {
    this.getContainerTypes()
    this.getProjects()
  }
}
</script>

<style scoped>
</style>

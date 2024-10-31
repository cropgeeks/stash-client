<template>
  <div>
    <section class="page-header bg-light p-5 mb-4 border">
      <b-row>
        <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
          <b-img fluid :src="require('@/assets/img/transfer-into-stash.svg')" alt="Import image" />
        </b-col>
        <b-col cols=12 md=8 order="2" order-md="1">
          <h1 class="display-4 text-center text-md-left">{{ $t('pageImportTitle') }}</h1>
          <p class="lead text-center text-md-left">{{ $t('pageImportText') }}</p>
        </b-col>
      </b-row>
    </section>
    <b-form @submit.prevent>
      <b-row>
        <b-col cols=12 md=6>
          <ContainerSearch label="formLabelImportInto" description="formDescriptionImportInto" :tabIndex="1" autofocus @container-selected="setContainer" />
        </b-col>
        <b-col cols=12 md=6>
          <ContainerTypeSelector @container-type-selected="ct => { selectedContainerType = ct }" />
          <ProjectSelector @project-selected="p => { selectedProject = p }" ref="projectSelector" />
          <TrialSelector @trial-selected="t => { selectedTrial = t }" :projectId="selectedProject ? selectedProject.id : null" ref="trialSelector" />
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

        <b-button @click="onSubmit" variant="primary"><BIconUpload /> {{ $t('buttonUpload') }}</b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import ContainerSearch from '@/components/ContainerSearch'
import ContainerTypeSelector from '@/components/ContainerTypeSelector'
import ProjectSelector from '@/components/ProjectSelector'
import TrialSelector from '@/components/TrialSelector'
import { apiPostContainerImport } from '@/plugins/api/container'

import { BIconX, BIconUpload } from 'bootstrap-vue'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconX,
    BIconUpload,
    ContainerTypeSelector,
    ContainerSearch,
    ProjectSelector,
    TrialSelector
  },
  data: function () {
    return {
      targetContainer: null,
      items: [],
      selectedContainerType: null,
      selectedProject: null,
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
  methods: {
    onSubmit: function () {
      const showWarning = this.items.some(i => i.containerId !== undefined && i.containerId !== null)

      if (showWarning) {
        this.$bvModal.msgBoxConfirm(this.$t('modalTextImportConfirmTransfer'), {
          title: this.$t('modalTitleImportConfirmTransfer'),
          okTitle: this.$t('buttonYes'),
          cancelTitle: this.$t('buttonNo')
        }).then(value => {
          if (value) {
            this.importData()
          }
        })
      } else {
        this.importData()
      }
    },
    importData: function () {
      apiPostContainerImport({
        parentContainerId: this.targetContainer.containerId,
        items: this.items
      }, result => {
        this.$bvModal.msgBoxOk(this.$tc('toastMessageContainersAdded', this.items.length), {
          title: this.$t('toastTitleSuccess'),
          okVariant: 'success',
          centered: true
        }).then(() => {
          this.targetContainer = null
          this.items = []
        })
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
        if (container.projectId) {
          this.$refs.projectSelector.selectProject(container.projectId)
        }
        if (container.trialId) {
          this.$refs.trialSelector.selectTrial(container.trialId)
        }
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
          if (item.containerId) {
            item._rowVariant = 'warning'
          }
          if (!this.items.find(i => i.containerBarcode === item.containerBarcode)) {
            this.items.push(item)
            this.$refs.itemSearch.reset()
          } else {
            emitter.emit('speak', this.$t('ttsNotificationDuplicateContainer'))
            this.$refs.itemSearch.reset()
          }
        }
      }
    }
  }
}
</script>

<style scoped>
</style>

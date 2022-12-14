<template>
  <div>
    <section class="page-header bg-light p-5 mb-4 border">
      <b-row>
        <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
          <b-img fluid :src="require('@/assets/img/predefine-containers.svg')" alt="Predefine image" />
        </b-col>
        <b-col cols=12 md=8 order="2" order-md="1">
          <h1 class="display-4 text-center text-md-left">{{ $t('pagePredefineTitle') }}</h1>
          <p class="lead text-center text-md-left">{{ $t('pagePredefineText') }}</p>
        </b-col>
      </b-row>
    </section>
    <div>
      <b-form @submit.prevent="parseInput" class="mb-3">
        <b-form-group :label="$t('formLabelPredefinePaste')" label-for="paste" :description="$t('formDescriptionPredefinePaste')">
          <b-form-textarea id="paste" @keydown.tab.prevent="tabber($event)" v-model="pastedInput" :rows="10" :placeholder="$t('formPlaceholderPredefinePaste')" />
        </b-form-group>

        <b-row>
          <b-col cols=12 md=4>
            <ContainerTypeSelector @container-type-selected="ct => { selectedContainerType = ct }" />
          </b-col>
          <b-col cols=12 md=4>
            <ProjectSelector @project-selected="p => { selectedProject = p }" />
          </b-col>
          <b-col cols=12 md=4>
            <TrialSelector @trial-selected="t => { selectedTrial = t }" :projectId="selectedProject ? selectedProject.id : null" />
          </b-col>
        </b-row>

        <b-button :variant="partOneComplete ? null : 'primary'" :disabled="!partOneValid" @click="parseInput"><BIconBoxArrowDown /> {{ $t('buttonLoad') }}</b-button>
      </b-form>

      <b-form @submit.prevent="checkForDuplicates" class="mb-3" v-if="partOneComplete">
        <h2>{{ $t('pagePredefineMappingTitle') }}</h2>
        <p>{{ $t('pagePredefineMappingText') }}</p>

        <b-list-group class="mb-3">
          <b-list-group-item variant="light" class="d-flex align-items-center text-dark">
            <BIconCheck :font-scale="2" class="text-success" v-if="barcodeMapped" /><BIconX :font-scale="2" class="text-danger" v-else /> {{ $t('pagePredefineMappingConditionBarcode') }}
          </b-list-group-item>
          <b-list-group-item variant="light" class="d-flex align-items-center text-dark">
            <BIconCheck :font-scale="2" class="text-success" v-if="barcodesUnique" /><BIconX :font-scale="2" class="text-danger" v-else /> {{ $t('pagePredefineMappingConditionBarcodesUnique') }}
          </b-list-group-item>
          <b-list-group-item variant="light" class="d-flex align-items-center text-dark">
            <BIconCheck :font-scale="2" class="text-success" v-if="noDuplicateMapping" /><BIconX :font-scale="2" class="text-danger" v-else /> {{ $t('pagePredefineMappingConditionMappingDuplicate') }}
          </b-list-group-item>
          <b-list-group-item variant="light" class="d-flex align-items-center text-dark" v-if="hasAttributeMapping">
            <BIconCheck :font-scale="2" class="text-success" v-if="allAttributeValuesSet" /><BIconX :font-scale="2" class="text-danger" v-else /> {{ $t('pagePredefineMappingConditionAttributesMapped') }}
          </b-list-group-item>
        </b-list-group>

        <b-row>
          <b-col cols=12 sm=6 md=4 lg=3 class="mb-3" v-for="(column, index) in columns" :key="`column-${index}-${column}`">
            <b-card class="h-100">
              <b-form-group :label="column" :label-for="`column-${index}`">
                <b-form-select :options="mappingOptions" v-model="columnMapping[index]" :id="`column-${index}`" required />
              </b-form-group>

              <b-form-group :label="$t('formLabelPredefineMappingAttribute')" :label-for="`attribute-${index}`" v-if="columnMapping[index] === 'attribute'">
                <b-form-select :options="attributeOptions" v-model="attributeMapping[index]" :id="`attribute-${index}`" required />
              </b-form-group>
            </b-card>
          </b-col>
        </b-row>

        <b-button variant="primary" :disabled="!partTwoValid" @click="checkForDuplicates"><BIconListCheck /> {{ $t('buttonUpload') }}</b-button>
        <p class="text-danger" v-if="errorMessage">{{ $t(errorMessage) }}</p>
      </b-form>
    </div>
  </div>
</template>

<script>
import ContainerTypeSelector from '@/components/ContainerTypeSelector'
import ProjectSelector from '@/components/ProjectSelector'
import TrialSelector from '@/components/TrialSelector'
import { BIconBoxArrowDown, BIconListCheck, BIconCheck, BIconX } from 'bootstrap-vue'
import { apiGetAttributes } from '@/plugins/api/attribute'
import { apiPostContainers, apiPostContainerTable } from '@/plugins/api/container'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const emitter = require('tiny-emitter/instance')
const d3Dsv = require('d3-dsv')

export default {
  components: {
    BIconBoxArrowDown,
    BIconListCheck,
    BIconCheck,
    BIconX,
    ContainerTypeSelector,
    ProjectSelector,
    TrialSelector
  },
  data: function () {
    return {
      pastedInput: null,
      parsedData: null,
      columns: [],
      attributeMapping: [],
      columnMapping: [],
      attributes: [],
      partTwoComplete: false,
      selectedContainerType: null,
      selectedProject: null,
      selectedTrial: null,
      errorMessage: null
    }
  },
  watch: {
    pastedInput: function () {
      this.parsedData = null
      this.columns = []
      this.attributeMapping = []
      this.columnMapping = []
      this.partTwoComplete = false
      this.errorMessage = null
    }
  },
  computed: {
    hasAttributeMapping: function () {
      return this.columnMapping.some(c => c === 'attribute')
    },
    barcodeMapped: function () {
      return this.columnMapping.some(c => c === 'barcode')
    },
    allAttributeValuesSet: function () {
      if (this.hasAttributeMapping) {
        for (let i = 0; i < this.columnMapping.length; i++) {
          if (this.columnMapping[i] === 'attribute' && (this.attributeMapping[i] === undefined || this.attributeMapping[i] === null)) {
            return false
          }
        }

        return true
      } else {
        return true
      }
    },
    barcodesUnique: function () {
      if (this.barcodeMapped) {
        const index = this.columnMapping.findIndex(c => c === 'barcode')

        const unique = new Set()

        let result = true
        this.parsedData.forEach(d => {
          if (unique.has(d[this.columns[index]])) {
            result = false
          } else {
            unique.add(d[this.columns[index]])
          }
        })
        return result
      } else {
        return false
      }
    },
    noDuplicateMapping: function () {
      if (this.columnMapping.filter(c => c === 'barcode').length > 1) {
        return false
      } else {
        const unique = new Set()

        let result = true
        this.attributeMapping.forEach(a => {
          if (a) {
            if (unique.has(a.id)) {
              result = false
            } else {
              unique.add(a.id)
            }
          }
        })
        return result
      }
    },
    partOneComplete: function () {
      return this.columns && this.columns.length > 0 && this.selectedContainerType
    },
    partOneValid: function () {
      return this.pastedInput !== undefined && this.pastedInput !== null && this.pastedInput !== ''
    },
    partTwoValid: function () {
      return this.barcodeMapped && this.noDuplicateMapping && this.barcodesUnique && (!this.hasAttributeMapping || this.allAttributeValuesSet)
    },
    mappingOptions: function () {
      return [{
        text: this.$t('formSelectOptionPredefineMappingBarcode'),
        value: 'barcode'
      }, {
        text: this.$t('formSelectOptionPredefineMappingDescription'),
        value: 'description'
      }, {
        text: this.$t('formSelectOptionPredefineMappingAttribute'),
        value: 'attribute'
      }, {
        text: this.$t('formSelectOptionPredefineMappingIgnore'),
        value: 'ignore'
      }]
    },
    attributeOptions: function () {
      if (this.attributes) {
        const result = this.attributes.map(a => {
          return {
            text: a.name,
            value: a
          }
        })
        result.unshift({
          text: this.$t('formSelectOptionPredefineAttributeSelect'),
          value: null
        })

        return result
      } else {
        return []
      }
    }
  },
  methods: {
    tabber: function (event) {
      const text = this.pastedInput
      if (text !== null) {
        const originalSelectionStart = event.target.selectionStart
        const textStart = text.slice(0, originalSelectionStart)
        const textEnd = text.slice(originalSelectionStart)

        this.pastedInput = `${textStart}\t${textEnd}`
        event.target.value = this.pastedInput // required to make the cursor stay in place.
        event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1
      }
    },
    parseInput: function () {
      // Parse the data and automatically trim it
      this.parsedData = d3Dsv.tsvParse(this.pastedInput, row => {
        Object.keys(row).forEach(k => {
          row[k] = (row[k] !== undefined && row[k] !== null) ? row[k].trim() : null
        })
        return row
      })

      if (this.parsedData.length > 0) {
        this.columns = this.parsedData.columns
        this.columnMapping = this.columns.map(c => 'ignore')
        this.attributeMapping = this.columns.map(c => null)
      } else {
        this.columns = []
        this.columnMapping = []
        this.attributeMapping = []
      }
    },
    checkForDuplicates: function () {
      if (!this.partTwoValid) {
        return
      }

      this.errorMessage = null
      const barcodeColumn = this.columns[this.columnMapping.findIndex(c => c === 'barcode')]

      emitter.emit('show-loading', true)

      apiPostContainerTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: [{
          column: 'containerBarcode',
          comparator: 'inSet',
          operator: 'and',
          values: this.parsedData.map(d => d[barcodeColumn])
        }]
      }, result => {
        emitter.emit('show-loading', false)
        if (result && result.data && result.data.length === 0) {
          this.onSubmit()
        } else {
          this.errorMessage = 'formErrorPredefinedMappingDuplicateBarcodeDatabase'
        }
      })

      this.partTwoComplete = true
    },
    onSubmit: function () {
      const barcodeColumn = this.columns[this.columnMapping.findIndex(c => c === 'barcode')]
      const descriptionColumn = this.columns[this.columnMapping.findIndex(c => c === 'description')]
      const attributeColumnIndices = []

      this.columnMapping.forEach((c, i) => {
        if (c === 'attribute') {
          attributeColumnIndices.push(i)
        }
      })

      apiPostContainers(this.parsedData.map(d => {
        const atts = attributeColumnIndices.map(ai => {
          return {
            attributeName: this.attributeMapping[ai].name,
            attributeValue: d[this.columns[ai]]
          }
        })

        return {
          containerBarcode: d[barcodeColumn],
          containerDescription: d[descriptionColumn],
          containerTypeId: this.selectedContainerType ? this.selectedContainerType.id : null,
          projectId: this.selectedProject ? this.selectedProject.id : null,
          trialId: this.selectedTrial ? this.selectedTrial.id : null,
          containerIsActive: true,
          containerAttributes: atts
        }
      }), result => {
        emitter.emit('show-loading', false)

        if (result && result.length > 0) {
          this.$bvModal.msgBoxOk(this.$tc('toastMessageContainersAdded', result.length), {
            title: this.$t('toastTitleSuccess'),
            okVariant: 'success',
            centered: true
          }).then(() => {
            this.pastedInput = null
          })
        }
      }, {
        codes: [400, 404, 409, 413, 417],
        callback: (e) => {
          emitter.emit('show-loading', false)
          switch (e.status) {
            case 400:
              this.errorMessage = 'formErrorPredefineMappingParameterIssue'
              break
            case 404:
              this.errorMessage = 'formErrorPredefineMappingBadReference'
              break
            case 409:
              this.errorMessage = 'formErrorPredefineMappingDuplicateBarcodeDatabase'
              break
            case 413:
              this.errorMessage = 'formErrorPredefineMappingBarcodeOrDescriptionTooLong'
              break
            case 417:
              this.errorMessage = 'formErrorPredefineMappingAttributeValueWrongType'
              break
          }
        }
      })
    }
  },
  mounted: function () {
    apiGetAttributes(result => {
      if (result) {
        this.attributes = result
      }
    })
  }
}
</script>

<style scoped>

</style>

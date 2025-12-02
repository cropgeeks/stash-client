<template>
  <v-container>
    <v-card class="mb-5">
      <div class="d-flex flex-nowrap flex-column flex-sm-row justify-space-between align-center ma-5 justify-center">
        <v-card-text class="flex-grow-1">
          <p class="text-h2">{{ $t('pagePredefineTitle') }}</p>

          <p class="text-subtitle-1 my-3">{{ $t('pagePredefineText') }}</p>
        </v-card-text>
        <v-avatar
          class="ma-3"
          rounded="0"
          size="150"
          image="/img/predefine-containers.svg"
        />
      </div>
    </v-card>

    <v-textarea
      :label="$t('formLabelPredefinePaste')"
      :hint="$t('formDescriptionPredefinePaste')"
      persistent-hint
      persistent-placeholder
      @keydown.tab.prevent="tabber($event)"
      v-model="dataInput"
      wrap="off"
      :placeholder="$t('formPlaceholderPredefinePaste')"
    />

    <v-row class="mt-3">
      <v-col cols="12" md="6" lg="3">
        <ContainerTypeSelect
          v-model="selectedContainerType"
        />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <ProjectSelect
          v-model="selectedProject"
          :auto-select-first="false"
        />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <TrialSelect
          v-model="selectedTrial"
          :project="selectedProject"
          :auto-select-first="false"
        />
      </v-col>
      <v-col cols="12" md="6" lg="3">
        <ContainerInput
          v-model="targetContainer"
          :label="$t('formLabelImportInto')"
          :hint="$t('formDescriptionImportInto')"
          scan-in-bottom-sheet
          :auto-focus="false"
        />
      </v-col>
    </v-row>

    <v-btn class="mt-3" :prepend-icon="mdiFileDownload" :text="$t('buttonLoad')" :disabled="!canLoadInput" @click="loadInput" />

    <div class="mt-3" v-if="inputColumns && inputColumns.length > 0">
      <v-list>
        <v-list-item :title="$t('pagePredefineMappingConditionBarcode')" active :prepend-icon="barcodeMapped ? mdiCheck : mdiClose" :color="barcodeMapped ? 'success' : 'error'" />
        <v-list-item :title="$t('pagePredefineMappingConditionBarcodesUnique')" active :prepend-icon="barcodesUnique ? mdiCheck : mdiClose" :color="barcodesUnique ? 'success' : 'error'" />
        <v-list-item :title="$t('pagePredefineMappingConditionMappingDuplicate')" active :prepend-icon="noDuplicateMapping ? mdiCheck : mdiClose" :color="noDuplicateMapping ? 'success' : 'error'" />
        <v-list-item :title="$t('pagePredefineMappingConditionAttributesMapped')" active :prepend-icon="allAttributeValuesSet ? mdiCheck : mdiClose" :color="allAttributeValuesSet ? 'success' : 'error'" v-if="hasAttributeMapping" />
      </v-list>

      <v-row>
        <v-col
          cols="12"
          md="4"
          lg="3"
          v-for="column in inputColumns"
          :key="`input-column-${column}`"
        >
          <v-card>
            <template #text>
              <v-select
                :label="column"
                hide-details
                v-model="columnMapping[column]"
                :items="columnMappingOptions"
              />

              <v-select
                v-if="columnMapping[column] === 'attribute'"
                v-model="attributeMapping[column]"
                :label="t('formSelectOptionPredefineAttributeSelect')"
                return-object
                hide-details
                item-value="id"
                item-title="name"
                :items="attributes"
              />
            </template>
          </v-card>
        </v-col>
      </v-row>

      <v-btn class="mt-3" :prepend-icon="mdiFormatListChecks" :text="$t('buttonUpload')" :disabled="!canUploadData" @click="uploadData" />

      <v-alert class="mt-3" color="error" variant="tonal" :icon="mdiAlert" :text="$t(errorMessage)" v-if="errorMessage" />
    </div>
  </v-container>
</template>

<script setup lang="ts">
  import { apiGetAttributes } from '@/plugins/api/attribute'
  import { FilterComparator, FilterOperator, UsersUserType, type ViewTableContainers, type Attributes, type ContainerTypes, type Projects, type Trials, type ContainerAttributeTimeline } from '@/plugins/types/stash'
  import { mdiAlert, mdiCheck, mdiClose, mdiFileDownload, mdiFormatListChecks } from '@mdi/js'
  import { tsvParse, type DSVParsedArray, type DSVRowString } from 'd3-dsv'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'
  import { apiPostContainers, apiPostContainersToParent, apiPostContainerTable } from '@/plugins/api/container'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import type { AxiosError } from 'axios'
  import ContainerInput from '@/components/input/ContainerInput.vue'

  definePage({
    meta: {
      minUserType: UsersUserType.reference,
    },
  })

  const { t } = useI18n()

  const dataInput = ref<string>()
  const selectedContainerType = ref<ContainerTypes>()
  const selectedProject = ref<Projects>()
  const selectedTrial = ref<Trials>()
  const attributes = ref<Attributes[]>([])
  const targetContainer = ref<ViewTableContainers>()

  const errorMessage = ref<string>()
  const parsedData = shallowRef<DSVParsedArray<DSVRowString<string>>>()
  const columnMapping = ref<{ [index: string]: 'barcode' | 'attribute' | 'ignore' }>({})
  const attributeMapping = ref<{ [index: string]: Attributes }>({})
  const inputColumns = ref<string[]>([])

  const canUploadData = computed(() => barcodeMapped.value && noDuplicateMapping.value && barcodesUnique.value && (!hasAttributeMapping.value || allAttributeValuesSet.value))
  const canLoadInput = computed(() => dataInput.value !== undefined && dataInput.value.trim().length > 0)
  const barcodeMapped = computed(() => Object.values(columnMapping.value).includes('barcode'))
  const hasAttributeMapping = computed(() => Object.values(columnMapping.value).includes('attribute'))
  const allAttributeValuesSet = computed(() => {
    if (hasAttributeMapping.value) {
      const mappedToAttribute = Object.keys(columnMapping.value).filter(k => columnMapping.value[k] === 'attribute')
      const attributeMappings = mappedToAttribute.map(a => attributeMapping.value[a]?.id)

      return attributeMappings.filter(am => am === undefined).length === 0
    } else {
      return true
    }
  })
  const noDuplicateMapping = computed(() => {
    const columnMappings = Object.values(columnMapping.value).filter(cm => cm !== 'attribute' && cm !== 'ignore')

    if (columnMappings.length !== new Set(columnMappings).size) {
      return false
    }

    const mappedToAttribute = Object.keys(columnMapping.value).filter(k => columnMapping.value[k] === 'attribute')
    const attributeMappings = mappedToAttribute.map(a => attributeMapping.value[a]?.id).filter(a => a !== undefined)

    if (attributeMappings.length !== new Set(attributeMappings).size) {
      return false
    }

    return true
  })
  const barcodesUnique = computed(() => {
    if (barcodeMapped.value) {
      const columnName = Object.keys(columnMapping.value).find(k => columnMapping.value[k] === 'barcode')

      if (!columnName) {
        return false
      }

      const unique = new Set<string>()

      let result = true
      parsedData.value?.forEach(d => {
        if (unique.has(d[columnName])) {
          result = false
        }
        unique.add(d[columnName])
      })
      return result
    } else {
      return false
    }
  })

  const columnMappingOptions = computed(() => {
    return [{
      value: 'barcode',
      title: t('formSelectOptionPredefineMappingBarcode'),
    }, {
      value: 'attribute',
      title: t('formSelectOptionPredefineMappingAttribute'),
    }, {
      value: 'ignore',
      title: t('formSelectOptionPredefineMappingIgnore'),
    }]
  })

  function uploadData () {
    const barcodeColumn = Object.keys(columnMapping.value).find(k => columnMapping.value[k] === 'barcode')

    if (!canUploadData.value || !parsedData.value || !barcodeColumn) {
      return
    }

    errorMessage.value = undefined

    emitter.emit('show-loading', true)

    apiPostContainerTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'containerBarcode',
          comparator: FilterComparator.inSet,
          values: parsedData.value.map(d => d[barcodeColumn]),
        }],
      }],
    }, result => {
      emitter.emit('show-loading', false)
      if (result && result.data && result.data.length === 0) {
        onSubmit()
      } else {
        errorMessage.value = 'formErrorPredefineMappingDuplicateBarcodeDatabase'
      }
    })
  }

  function onSubmit () {
    const barcodeColumn = Object.keys(columnMapping.value).find(k => columnMapping.value[k] === 'barcode')

    const sct = selectedContainerType.value
    if (!barcodeColumn || !sct || !parsedData.value) {
      return
    }

    const mappedToAttribute = Object.keys(columnMapping.value).filter(k => columnMapping.value[k] === 'attribute')
    const mapped: ViewTableContainers[] = parsedData.value.map(d => {
      const timeline: ContainerAttributeTimeline = {
        date: new Date().toISOString().split('T')[0],
        attributeValues: {},
      }

      mappedToAttribute.map(ai => {
        return {
          attributeId: attributeMapping.value[ai].id,
          attributeValue: d[ai],
        }
      }).filter(ai => ai.attributeValue !== undefined && ai.attributeValue !== '').forEach(ai => {
        timeline.attributeValues[ai.attributeId] = ai.attributeValue
      })

      return {
        containerBarcode: d[barcodeColumn],
        containerTypeId: sct.id || -1,
        projectId: selectedProject.value?.id,
        trialId: selectedTrial.value?.id,
        containerIsActive: true,
        containerAttributes: [timeline],
      }
    })

    const resultHandler = (result: number[]) => {
      emitter.emit('show-loading', false)

      if (result && result.length > 0) {
        emitter.emit('show-snackbar', {
          text: t('toastMessageContainersAdded', result.length),
          color: 'success',
        })
        dataInput.value = undefined
        selectedContainerType.value = undefined
        selectedProject.value = undefined
        selectedTrial.value = undefined
        parsedData.value = undefined
        columnMapping.value = {}
        attributeMapping.value = {}
        inputColumns.value = []
      }

      emitter.emit('update-container-attributes')
    }

    const errorHandler = {
      codes: [400, 404, 409, 413, 417],
      callback: (e: AxiosError) => {
        emitter.emit('show-loading', false)
        switch (e.status) {
          case 400:
            errorMessage.value = 'formErrorPredefineMappingParameterIssue'
            break
          case 404:
            errorMessage.value = 'formErrorPredefineMappingBadReference'
            break
          case 409:
            errorMessage.value = 'formErrorPredefineMappingDuplicateBarcodeDatabase'
            break
          case 417:
            errorMessage.value = 'formErrorPredefineMappingAttributeValueWrongType'
            break
        }
      },
    }

    if (targetContainer.value && targetContainer.value.containerId) {
      apiPostContainersToParent(targetContainer.value.containerId, mapped, resultHandler, errorHandler)
    } else {
      apiPostContainers(mapped, resultHandler, errorHandler)
    }
  }

  function loadInput () {
    // Parse the data and automatically trim it
    parsedData.value = tsvParse(dataInput.value || '', row => {
      Object.keys(row).forEach(k => {
        row[k] = (row[k] !== undefined && row[k] !== null) ? row[k].trim() : ''
      })
      return row
    })

    inputColumns.value = parsedData.value.columns
    columnMapping.value = {}
    parsedData.value.columns.forEach(c => {
      const lower = c.trim().toLowerCase()
      switch (lower) {
        case 'barcode':
          columnMapping.value[c] = 'barcode'
          break
        default:
          columnMapping.value[c] = 'ignore'
      }
    })
  }

  function tabber (event: any) {
    const text = dataInput.value

    if (!text) {
      return
    }

    const originalSelectionStart = event.target.selectionStart
    const textStart = text.slice(0, originalSelectionStart)
    const textEnd = text.slice(originalSelectionStart)

    dataInput.value = `${textStart}\t${textEnd}`
    event.target.value = dataInput.value // required to make the cursor stay in place.
    event.target.selectionEnd = event.target.selectionStart = originalSelectionStart + 1
  }

  onMounted(() => {
    apiGetAttributes(result => {
      if (result) {
        attributes.value = result
      }
    })
  })
</script>

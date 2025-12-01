<template>
  <div>
    <v-text-field
      v-model="containerSearch"
      :label="label"
      :hint="hint"
      :persistent-hint="hint !== undefined"
      :hide-details="hint === undefined"
      :autofocus="autoFocus"
      clearable
      autocomplete="off"
      ref="searchField"
      @keyup.enter.exact="setMatch()"
      @blur="setMatch()"
      :prepend-inner-icon="mdiMagnify"
    >
      <template #prepend>
        <v-btn :icon="mdiQrcodeScan" v-tooltip:top="$t('tooltipScanCode')" @click="toggleCamera" :color="showCamera ? 'info' : undefined" />
      </template>
    </v-text-field>

    <v-list v-if="potentialMatches && potentialMatches.length > 0">
      <v-list-subheader>{{ $t('widgetContainerSearchPotentialMatches') }}</v-list-subheader>
      <v-list-item
        v-for="item in potentialMatches"
        :key="`potential-match-${item.containerId}`"
        :title="item.containerBarcode"
        :subtitle="item.containerDescription"
        @click="selectItem(item)"
      />
    </v-list>

    <v-bottom-sheet
      v-if="scanInBottomSheet"
      v-model="bottomSheetVisible"
      inset
      max-height="75vh"
    >
      <v-sheet class="d-flex align-center justify-center">
        <QrcodeStream
          v-if="showCamera"
          class="camera-scan"
          :formats="['qr_code', 'code_128', 'code_39', 'upc_a', 'upc_e']"
          @detect="onDetect"
        />
      </v-sheet>
    </v-bottom-sheet>
    <div class="d-flex align-center justify-center" v-else>
      <QrcodeStream
        v-if="showCamera"
        class="camera-scan"
        :formats="['qr_code', 'code_128', 'code_39', 'upc_a', 'upc_e']"
        @detect="onDetect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { mdiMagnify, mdiQrcodeScan } from '@mdi/js'
  import { QrcodeStream, type DetectedBarcode } from 'vue-qrcode-reader'

  import { useI18n } from 'vue-i18n'
  import { FilterComparator, FilterOperator, type ViewTableContainers } from '@/plugins/types/stash'
  import { apiPostContainerTable } from '@/plugins/api/container'
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

  import emitter from 'tiny-emitter/instance'

  const { t } = useI18n()

  const container = defineModel<ViewTableContainers>()
  const potentialMatches = ref<ViewTableContainers[]>([])
  const containerSearch = ref<string>()
  const showCamera = ref(false)
  const bottomSheetVisible = ref(false)

  export interface ContainerSearchProps {
    label: string
    hint?: string
    scanInBottomSheet?: boolean
    onlyAllowMatches?: boolean
    autoFocus?: boolean
  }

  const compProps = withDefaults(defineProps<ContainerSearchProps>(), {
    scanInBottomSheet: false,
    onlyAllowMatches: true,
    autoFocus: true,
  })

  function selectItem (item: ViewTableContainers) {
    containerSearch.value = undefined
    container.value = item
    potentialMatches.value = []
  }

  function toggleCamera () {
    if (compProps.scanInBottomSheet) {
      bottomSheetVisible.value = true

      nextTick(() => {
        showCamera.value = !showCamera.value
      })
    } else {
      showCamera.value = !showCamera.value
    }
  }

  function onDetect (detectedCodes: DetectedBarcode[]) {
    if (detectedCodes && detectedCodes.length > 0) {
      const c = detectedCodes[0]?.rawValue

      if (c) {
        containerSearch.value = c

        nextTick(() => setMatch())

        showCamera.value = false

        nextTick(() => {
          bottomSheetVisible.value = false
        })
      }
    }
  }

  function setMatch () {
    if (!containerSearch.value || containerSearch.value.trim().length === 0) {
      return
    }

    apiPostContainerTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      prevCount: -1,
      filters: [{
        filters: [{
          column: 'containerBarcode',
          comparator: FilterComparator.equals,
          values: [containerSearch.value || ''],
        }, {
          column: 'containerDescription',
          comparator: FilterComparator.contains,
          values: [containerSearch.value || ''],
        }],
        operator: FilterOperator.or,
      }],
    }, result => {
      if (result && result.data && result.data.length > 0) {
        if (result.data.length === 1) {
          container.value = result.data[0]
          potentialMatches.value = []
        } else {
          container.value = undefined
          potentialMatches.value = result.data
        }
      } else {
        if (compProps.onlyAllowMatches) {
          container.value = undefined
          emitter.emit('show-snackbar', {
            text: t('widgetContainerNoMatchTitle'),
            color: 'warning',
          })
        } else {
          container.value = {
            containerBarcode: t('widgetContainerNoMatchTitle'),
            containerDescription: t('widgetContainerNoMatchSubtitle'),
            containerTypeId: -1,
          }
        }

        potentialMatches.value = []
      }
    })
  }

  function reload () {
    setMatch()
  }

  watch(bottomSheetVisible, async () => {
    showCamera.value = false
  })

  watch(container, async (newValue, oldValue) => {
    if (!newValue) {
      containerSearch.value = undefined
    } else {
      if (!oldValue || oldValue.containerBarcode !== newValue.containerBarcode) {
        emitter.emit('tts', newValue.containerBarcode)
      }
      containerSearch.value = newValue.containerBarcode
    }
  })

  onMounted(() => {
    // TODO
  })

  defineExpose({
    reload,
  })
</script>

<style scoped>
.camera-scan {
  max-width: 600px;
}
</style>

<template>
  <div>
    <b-form-group :label="$t(label)" :label-for="`container-${id}`" :description="$t(description)">
      <b-input-group>
        <b-input-group-prepend>
          <b-button @click="$refs.barcodeScannerModal.show()" v-b-tooltip="$t('tooltipScanCode')">
            <!-- TODO: Replace with bootstrap-vue icon once new version is released -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-qr-code-scan" viewBox="0 0 16 16">
              <path d="M0 .5A.5.5 0 0 1 .5 0h3a.5.5 0 0 1 0 1H1v2.5a.5.5 0 0 1-1 0v-3Zm12 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V1h-2.5a.5.5 0 0 1-.5-.5ZM.5 12a.5.5 0 0 1 .5.5V15h2.5a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5Zm15 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H15v-2.5a.5.5 0 0 1 .5-.5ZM4 4h1v1H4V4Z"/>
              <path d="M7 2H2v5h5V2ZM3 3h3v3H3V3Zm2 8H4v1h1v-1Z"/>
              <path d="M7 9H2v5h5V9Zm-4 1h3v3H3v-3Zm8-6h1v1h-1V4Z"/>
              <path d="M9 2h5v5H9V2Zm1 1v3h3V3h-3ZM8 8v2h1v1H8v1h2v-2h1v2h1v-1h2v-1h-3V8H8Zm2 2H9V9h1v1Zm4 2h-1v1h-2v1h3v-2Zm-4 2v-1H8v1h2Z"/>
              <path d="M12 9h2V8h-2v1Z"/>
            </svg>
          </b-button>
        </b-input-group-prepend>
        <b-form-input :tabindex="tabIndex" :id="`container-${id}`" lazy :autofocus="autofocus" v-model="barcode" required />
      </b-input-group>
    </b-form-group>

    <b-card :title="container.containerBarcode" :sub-title="container.containerDescription" v-if="container">
      <b-row>
        <b-col cols=12 md=6>
          <b-card-text><h5><BIconTag /> {{ $t('widgetContainerType') }}</h5><p><b-badge>{{ container.containerTypeName }}</b-badge></p></b-card-text>
        </b-col>
        <b-col cols=12 md=6>
          <b-card-text><h5><BIconCheck2Square /> {{ $t('widgetContainerIsActive') }}</h5><p><b-badge>{{ container.containerIsActive }}</b-badge></p></b-card-text>
        </b-col>
        <b-col cols=12 md=6>
          <b-card-text><h5><BIconJournalAlbum /> {{ $t('widgetContainerProject') }}</h5><p>{{ container.projectName }}</p></b-card-text>
        </b-col>
        <b-col cols=12 md=6>
          <b-card-text><h5><BIconColumnsGap /> {{ $t('widgetContainerTrial') }}</h5><p>{{ container.trialName || 'N/A' }}</p></b-card-text>
        </b-col>
        <b-col cols=12 md=6>
          <b-card-text><h5><BIconDiagram3 /> {{ $t('widgetContainerSubContainerCount') }}</h5><p>{{ (container.subContainerCount || 0).toLocaleString() }}</p></b-card-text>
        </b-col>
      </b-row>
    </b-card>

    <BarcodeScannerModal ref="barcodeScannerModal" @code-scanned="codeScanned" />
  </div>
</template>

<script>
import BarcodeScannerModal from '@/components/modals/BarcodeScannerModal'
import { apiPostContainerTable } from '@/plugins/api/container'
import { uuidv4 } from '@/plugins/util'
import { BIconCheck2Square, BIconTag, BIconColumnsGap, BIconJournalAlbum, BIconDiagram3 } from 'bootstrap-vue'

export default {
  components: {
    BIconCheck2Square,
    BIconTag,
    BIconJournalAlbum,
    BIconColumnsGap,
    BIconDiagram3,
    BarcodeScannerModal
  },
  props: {
    label: {
      type: String,
      default: 'formLabelBarcode'
    },
    description: {
      type: String,
      default: 'formDescriptionBarcode'
    },
    tabIndex: {
      type: Number,
      default: 1
    },
    autofocus: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    const id = uuidv4()

    return {
      id: id,
      barcode: null,
      container: null
    }
  },
  watch: {
    container: function (newValue) {
      this.$emit('container-selected', newValue)
    },
    barcode: function (newValue) {
      if (newValue) {
        this.getContainerDetails()
      } else {
        this.container = null
      }
    }
  },
  methods: {
    getContainerDetails: function () {
      apiPostContainerTable({
        page: 1,
        limit: 1,
        filter: [{
          column: 'containerBarcode',
          comparator: 'equals',
          operator: 'and',
          values: [this.barcode]
        }]
      }, result => {
        if (result && result.data && result.data.length > 0) {
          this.container = result.data[0]
        } else {
          this.container = null
        }
      })
    },
    codeScanned: function (value) {
      this.barcode = value
    },
    update: function () {
      this.getContainerDetails()
    }
  }
}
</script>

<style>

</style>
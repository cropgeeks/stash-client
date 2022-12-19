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
        <b-form-input ref="barcodeInput" type="search" :tabindex="tabIndex" :id="`container-${id}`" lazy :autofocus="autofocus" v-model="barcode" required />
      </b-input-group>
    </b-form-group>

    <template v-if="container && container.containerId">
      <b-card :title="container.containerBarcode" :sub-title="container.containerDescription" v-if="showPreview">
        <b-row>
          <b-col cols=12 md=6>
            <b-card-text v-if="container.containerTypeName"><h5><BIconTag /> {{ $t('widgetContainerType') }}</h5><h5><p><b-badge><span class="container-type-icon" v-if="container.containerTypeIcon" v-html="container.containerTypeIcon" /> {{ container.containerTypeName }}</b-badge></p></h5></b-card-text>
          </b-col>
          <b-col cols=12 md=6>
            <b-card-text v-if="container.containerIsActive !== undefined"><h5><BIconCheck2Square /> {{ $t('widgetContainerIsActive') }}</h5><h5><p><b-badge :variant="container.containerIsActive ? 'success' : 'warning'">{{ container.containerIsActive }}</b-badge></p></h5></b-card-text>
          </b-col>
          <b-col cols=12 md=6>
            <b-card-text v-if="container.projectName"><h5><BIconJournalAlbum /> {{ $t('widgetContainerProject') }}</h5><p>{{ container.projectName }}</p></b-card-text>
          </b-col>
          <b-col cols=12 md=6>
            <b-card-text v-if="container.trialName"><h5><BIconColumnsGap /> {{ $t('widgetContainerTrial') }}</h5><p>{{ container.trialName || 'N/A' }}</p></b-card-text>
          </b-col>
          <b-col cols=12 md=6>
            <b-card-text v-if="container.parentId !== undefined">
              <h5><BIconBoxArrowInUp /> {{ $t('widgetContainerParent') }}</h5>
              <p>{{ container.parentBarcode }}</p>
              <h5>
                <p><b-badge variant="light"><span class="container-type-icon" v-if="container.parentContainerTypeIcon" v-html="container.parentContainerTypeIcon" /> {{ container.parentContainerTypeName }}</b-badge></p>
              </h5>
            </b-card-text>
          </b-col>
          <b-col cols=12 md=6>
            <b-card-text v-if="container.subContainerCount !== undefined"><h5><BIconDiagram3 /> {{ $t('widgetContainerSubContainerCount') }}</h5><p>{{ (container.subContainerCount || 0).toLocaleString() }}</p></b-card-text>
          </b-col>
        </b-row>

        <template #footer v-if="container && container.containerId">
          <b-button @click="$refs.containerHistoryModal.show()"><BIconClockHistory /> {{ $t('buttonContainerTransferHistory') }}</b-button>
          <b-button @click="$refs.containerContentModal.show()" class="ml-3" v-if="container.subContainerCount"><BIconDiagram3 /> {{ $t('buttonContainerContent') }}</b-button>
          <b-button @click="clearContainer(container)" class="ml-3" v-if="container.subContainerCount" variant="outline-danger"><BIconTrash /> {{ $t('buttonContainerClear') }}</b-button>
        </template>
      </b-card>
    </template>
    <template v-else-if="barcode && barcode.length > 0 && containers.length < 1">
      <b-card :title="$t('widgetContainerNoMatchTitle')" :sub-title="$t('widgetContainerNoMatchSubtitle')">
      </b-card>
    </template>

    <BarcodeScannerModal ref="barcodeScannerModal" @code-scanned="codeScanned" />
    <ContainerHistoryModal :container="container" ref="containerHistoryModal" />
    <ContainerContentModal :container="container" ref="containerContentModal" />
    <ContainerSelectModal :containers="containers" ref="containerSelectModal" @container-selected="toSelect => { container = toSelect }" />
  </div>
</template>

<script>
import BarcodeScannerModal from '@/components/modals/BarcodeScannerModal'
import ContainerHistoryModal from '@/components/modals/ContainerHistoryModal'
import ContainerContentModal from '@/components/modals/ContainerContentModal'
import ContainerSelectModal from '@/components/modals/ContainerSelectModal'
import { apiGetContainerClear, apiPostContainerTable } from '@/plugins/api/container'
import { uuidv4 } from '@/plugins/util'
import { BIconCheck2Square, BIconTag, BIconColumnsGap, BIconJournalAlbum, BIconDiagram3, BIconClockHistory, BIconBoxArrowInUp, BIconTrash } from 'bootstrap-vue'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconCheck2Square,
    BIconTag,
    BIconJournalAlbum,
    BIconBoxArrowInUp,
    BIconColumnsGap,
    BIconDiagram3,
    BIconTrash,
    BIconClockHistory,
    BarcodeScannerModal,
    ContainerHistoryModal,
    ContainerContentModal,
    ContainerSelectModal
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
    },
    showPreview: {
      type: Boolean,
      default: true
    }
  },
  data: function () {
    const id = uuidv4()

    return {
      id: id,
      barcode: null,
      containers: [],
      container: null
    }
  },
  watch: {
    container: function (newValue) {
      if (newValue) {
        emitter.emit('speak', newValue.containerBarcode)
      }
      this.$emit('container-selected', newValue)
    },
    barcode: function (newValue) {
      if (newValue) {
        this.getContainerDetails()
      } else {
        this.container = null
      }
    },
    containers: function (newValue) {
      if (newValue && newValue.length > 0) {
        this.$refs.containerSelectModal.show()
      } else {
        this.$refs.containerSelectModal.hide()
      }
    }
  },
  methods: {
    clearContainer: function (container) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTextClearContainerConfirm'), {
        title: this.$t('modalTitleClearContainerConfirm'),
        okTitle: this.$t('buttonYes'),
        cancelTitle: this.$t('buttonNo')
      }).then(value => {
        if (value) {
          apiGetContainerClear(container.containerId, () => this.getContainerDetails())
        }
      })
    },
    getContainerDetails: function () {
      apiPostContainerTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: [{
          column: 'containerBarcode',
          comparator: 'equals',
          operator: 'or',
          values: [this.barcode]
        }, {
          column: 'containerDescription',
          comparator: 'contains',
          operator: 'or',
          values: [this.barcode]
        }]
      }, result => {
        if (result && result.data) {
          if (result.data.length === 1) {
            this.container = result.data[0]
            this.containers = []
          } else {
            this.container = null
            this.containers = result.data
          }
        } else {
          this.container = {
            containerBarcode: this.$t('widgetContainerNoMatchTitle'),
            containerDescription: this.$t('widgetContainerNoMatchSubtitle')
          }
          this.containers = []
        }
      })
    },
    codeScanned: function (value) {
      this.barcode = value
    },
    update: function () {
      this.getContainerDetails()
    },
    reset: function () {
      this.barcode = null
      this.container = null
    },
    focus: function () {
      this.$refs.barcodeInput.focus()
    }
  }
}
</script>

<style>
.container-type-icon svg {
  max-height: 24px;
  max-width: 24px;
}
</style>

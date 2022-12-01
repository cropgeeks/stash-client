<template>
  <div>
    <section class="page-header bg-light p-5 mb-4 border">
      <b-row>
        <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
          <b-img fluid :src="require('@/assets/img/transfer-between-stashes.svg')" alt="Transfer image" />
        </b-col>
        <b-col cols=12 md=8 order="2" order-md="1">
          <h1 class="display-4 text-center text-md-left">{{ $t('pageTransferTitle') }}</h1>
          <p class="lead text-center text-md-left">{{ $t('pageTransferText') }}</p>
        </b-col>
      </b-row>
    </section>
    <b-form @submit.prevent.stop="initTransfer">
      <b-row>
        <b-col cols=12 md=5 class="mb-3">
          <ContainerSearch ref="sourceContainer" label="formLabelTransferFrom" description="formDescriptionTransferFrom" :tabIndex="1" autofocus @container-selected="setContainerFrom" />
        </b-col>

        <b-col cols=12 md=2 class="d-flex align-items-center justify-content-center">
          <b-img class="p-3 transfer-arrow" fluid-grow :src="require('@/assets/img/transfer-arrow.svg')" />
        </b-col>

        <b-col cols=12 md=5 class="mb-3">
          <ContainerSearch ref="targetContainer" label="formLabelTransferTo" description="formDescriptionTransferTo" :tabIndex="2" @container-selected="setContainerTo" />
        </b-col>
      </b-row>

      <b-button variant="primary" type="submit" :disabled="error !== null"><BIconBoxArrowRight /> {{ $t('buttonMakeTransfer') }}</b-button>
      <p v-if="error"><small :class="error.variant">{{ $t(error.text) }}</small></p>
    </b-form>

    <div v-if="result !== null">
      <h3>{{ $t('pageTransferResultTitle') }}</h3>
      <p>{{ $tc('pageTransferResultText', result) }}</p>

      <ContainerTransferTable :getData="getTransferData" ref="transferTable" />
    </div>
  </div>
</template>

<script>
import ContainerTransferTable from '@/components/tables/ContainerTransferTable'
import ContainerSearch from '@/components/ContainerSearch'
import { BIconBoxArrowRight } from 'bootstrap-vue'

import { apiPostContainerTransfer, apiPostContainerTransferTable } from '@/plugins/api/container'

const emitter = require('tiny-emitter/instance')

export default {
  components: {
    BIconBoxArrowRight,
    ContainerSearch,
    ContainerTransferTable
  },
  data: function () {
    return {
      containerFrom: null,
      containerTo: null,
      result: null
    }
  },
  computed: {
    error: function () {
      if (!this.containerFrom && !this.containerFrom) {
        return {
          text: '',
          variant: 'text-info'
        }
      } else if (!this.containerFrom) {
        return {
          text: 'pageTransferErrorMissingFrom',
          variant: 'text-warning'
        }
      } else if (!this.containerTo) {
        return {
          text: 'pageTransferErrorMissingTo',
          variant: 'text-warning'
        }
      } else if (this.containerFrom.containerTypeId !== this.containerTo.containerTypeId) {
        return {
          text: 'pageTransferErrorIncompatibleTypes',
          variant: 'text-danger'
        }
      } else if (this.containerFrom.containerId === this.containerTo.containerId) {
        return {
          text: 'pageTransferErrorSameContainer',
          variant: 'text-danger'
        }
      } else if (!this.containerFrom.subContainerCount || this.containerFrom.subContainerCount < 1) {
        return {
          text: 'pageTransferErrorFromEmpty',
          variant: 'text-danger'
        }
      } else {
        return null
      }
    }
  },
  methods: {
    setContainerFrom: function (value) {
      this.containerFrom = value
      this.$refs.targetContainer.focus()
    },
    setContainerTo: function (value) {
      this.containerTo = value
    },
    initTransfer: function () {
      this.result = null

      if (this.error) {
        return
      }

      emitter.emit('show-loading', true)

      apiPostContainerTransfer({
        sourceId: this.containerFrom.containerId,
        targetId: this.containerTo.containerId
      }, count => {
        emitter.emit('show-loading', false)

        this.$refs.sourceContainer.update()
        this.$refs.targetContainer.update()

        this.result = count

        this.updateTransferTable()
      }, {
        codes: [400, 404, 417],
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
                text: 'pageTransferErrorContainerNotFound',
                variant: 'text-danger'
              }
              break
            case 417:
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
    updateTransferTable: function () {
      this.$refs.transferTable()
    },
    getTransferData: function (page, limit, prevCount) {
      return apiPostContainerTransferTable({
        page: page,
        limit: limit,
        prevCount: prevCount,
        filter: [{
          column: 'sourceId',
          comparator: 'equals',
          operator: 'and',
          values: [this.containerFrom.containerId]
        }, {
          column: 'targetId',
          comparator: 'equals',
          operator: 'and',
          values: [this.containerTo.containerId]
        }]
      })
    }
  }
}
</script>

<style scoped>
.transfer-arrow {
  max-width: 120px;
}
@media (min-width: 768px) {
  .transfer-arrow {
    transform: rotate(-90deg);
  }
}
</style>

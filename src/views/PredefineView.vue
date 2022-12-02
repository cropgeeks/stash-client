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
        <b-form-group :label="$t('formLabelPredefinePaste')" label-for="paste" :description="$t('formPlaceholderPredefinePaste')">
          <b-form-textarea id="paste" v-model="pastedInput" :rows="10" />
        </b-form-group>

        <b-button :variant="partOneComplete ? null : 'primary'" :disabled="!partOneValid" @click="parseInput"><BIconBoxArrowDown /> {{ $t('buttonImport') }}</b-button>
      </b-form>

      <b-form @submit.prevent="checkMapping" class="mb-3" v-if="partOneComplete">
        <b-row>
          <b-col cols=12 sm=6 md=4 lg=3 v-for="(column, index) in columns" :key="`column-${index}-${column}`">
            <b-form-group :label="column" :label-for="`column-${index}`">
              <b-form-select :options="mappingOptions" v-model="columnMapping[index]" :id="`column-${index}`" required />
            </b-form-group>
          </b-col>
        </b-row>

        <b-button variant="primary" :disabled="!partTwoValid" @click="checkMapping"><BIconListCheck /> {{ $t('buttonCheck') }}</b-button>
      </b-form>
    </div>
  </div>
</template>

<script>
import { BIconBoxArrowDown, BIconListCheck } from 'bootstrap-vue'
import { apiGetAttributes } from '@/plugins/api/attribute'

export default {
  components: {
    BIconBoxArrowDown,
    BIconListCheck
  },
  data: function () {
    return {
      pastedInput: null,
      columns: [],
      columnMapping: [],
      attributes: [],
      partTwoComplete: false
    }
  },
  computed: {
    partOneComplete: function () {
      return this.columns && this.columns.length > 0
    },
    partOneValid: function () {
      return this.pastedInput !== undefined && this.pastedInput !== null && this.pastedInput !== ''
    },
    partTwoValid: function () {
      return this.columnMapping.some(c => c === 'barcode')
    },
    mappingOptions: function () {
      return [{
        text: this.$t('selectOptionPredefineMappingBarcode'),
        value: 'barcode'
      }, {
        text: this.$t('selectOptionPredefineMappingDescription'),
        value: 'description'
      }, {
        text: this.$t('selectOptionPredefineMappingAttribute'),
        value: 'attribute'
      }, {
        text: this.$t('selectOptionPredefineMappingIgnore'),
        value: 'ignore'
      }]
    }
  },
  methods: {
    parseInput: function () {
      const data = this.pastedInput.split(/\r?\n/).map(r => r.split('\t'))
      if (data.length > 0) {
        this.columns = data[0]
        this.columnMapping = data[0].map(c => 'ignore')
      } else {
        this.columns = []
        this.columnMapping = []
      }
    },
    checkMapping: function () {
      // TODO
      this.partTwoComplete = true
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

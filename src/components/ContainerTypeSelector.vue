<template>
  <div>
    <b-form-group :label="$t('formLabelImportContainerType')" :description="$t('formDescriptionImportContainerType')" label-for="container-type">
      <b-input-group>
        <CustomDropdown :items="containerTypes" v-model="selectedContainerType" id="container-type" />
        <!-- <b-form-select :options="containerTypes" v-model="selectedContainerType" id="container-type" /> -->
        <b-input-group-addon>
          <b-button @click="$refs.addContainerTypesModal.show()"><BIconPlusSquare /></b-button>
        </b-input-group-addon>
      </b-input-group>
    </b-form-group>

    <AddContainerTypeModal ref="addContainerTypesModal" @container-type-added="getContainerTypes" />
  </div>
</template>

<script>
import CustomDropdown from '@/components/CustomDropdown'
import AddContainerTypeModal from '@/components/modals/AddContainerTypeModal'
import { apiPostContainerTypeTable } from '@/plugins/api/container'
import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
import { BIconPlusSquare } from 'bootstrap-vue'

export default {
  components: {
    BIconPlusSquare,
    AddContainerTypeModal,
    CustomDropdown
  },
  data: function () {
    return {
      containerTypes: [],
      selectedContainerType: null
    }
  },
  watch: {
    selectedContainerType: function (newValue) {
      this.$emit('container-type-selected', newValue)
    }
  },
  methods: {
    getContainerTypes: function (newContainer) {
      apiPostContainerTypeTable({
        page: 1,
        limit: MAX_JAVA_INTEGER,
        orderBy: 'id',
        ascending: 1
      }, result => {
        if (result && result.data) {
          this.containerTypes = result.data.map(t => {
            return {
              text: t.name,
              value: t,
              icon: t.icon
            }
          })

          if (result.data.length > 0) {
            if (newContainer) {
              this.selectedContainerType = result.data.find(p => p.id === newContainer.id)
            } else {
              this.selectedContainerType = result.data[0]
            }
          } else {
            this.selectedContainerType = null
          }
        } else {
          this.containerTypes = []
        }
      })
    }
  },
  mounted: function () {
    this.getContainerTypes()
  }
}
</script>

<style>

</style>

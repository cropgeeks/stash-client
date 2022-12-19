<template>
  <b-modal :title="$t('modalTitleContainerSelect')"
           :ok-title="$t('buttonClose')"
           ok-variant="secondary"
           ok-only
           ref="containerSelectModal">
    <div v-if="containers">
      <b-list-group>
        <b-list-group-item href="#" @click="selectContainer(container)" class="flex-column align-items-start" v-for="container in containers" :key="`container-${container.containerId}`">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">{{ container.containerBarcode }}</h5>
            <small><b-badge><span class="container-type-icon" v-if="container.containerTypeIcon" v-html="container.containerTypeIcon" /> {{ container.containerTypeName }}</b-badge></small>
          </div>

          <p class="mb-1" v-if="container.containerDescription">{{ container.containerDescription }}</p>
        </b-list-group-item>
      </b-list-group>
    </div>
  </b-modal>
</template>

<script>
export default {
  props: {
    containers: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    selectContainer: function (container) {
      this.$emit('container-selected', container)
      this.hide()
    },
    /**
     * Shows the modal dialog and resets it to its initial state
     */
    show: function () {
      this.$nextTick(() => this.$refs.containerSelectModal.show())
    },
    /**
     * Hides the modal dialog
     */
    hide: function () {
      this.$nextTick(() => this.$refs.containerSelectModal.hide())
    }
  }
}
</script>

<style>
</style>

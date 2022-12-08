<template>
  <b-dropdown :id="id" class="custom-dropdown">
    <template #button-content>
      <span v-if="selectedOption">
        <span v-if="selectedOption.icon" v-html="selectedOption.icon" /> {{ selectedOption.text }}
      </span>
      <span v-else>{{ $t('formDropdownTitleSelectOption') }}</span>
    </template>
    <b-dropdown-item v-for="item in items" :key="`dd-${item.text}`" @click="$emit('input', item.value)">
      <span v-if="item.icon" v-html="item.icon" /> {{ item.text }}
    </b-dropdown-item>
  </b-dropdown>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    id: {
      type: String,
      default: ''
    },
    value: {
      type: Object,
      default: null
    }
  },
  computed: {
    selectedOption: function () {
      if (this.value) {
        return this.items.find(i => i.value === this.value) || { text: this.$t('formDropdownTitleSelectOption') }
      } else {
        return {
          text: this.$t('formDropdownTitleSelectOption')
        }
      }
    }
  }
}
</script>

<style>
.custom-dropdown {
  flex-grow: 1;
}
.custom-dropdown button.btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.custom-dropdown .dropdown-menu {
  min-width: 100%;
}
.custom-dropdown svg {
  max-height: 24px;
  max-width: 24px;
}
</style>

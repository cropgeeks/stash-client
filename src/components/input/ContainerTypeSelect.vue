<template>
  <v-select
    v-model="model"
    return-object
    item-value="id"
    item-title="name"
    density="compact"
    :label="$t('formLabelImportContainerType')"
    :hint="$t('formDescriptionImportContainerType')"
    persistent-hint
    :items="containerTypes"
  >
    <template #item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="item.raw.name"
      >
        <template #prepend>
          <span v-if="item.raw.icon" class="mt-1 me-2" v-html="item.raw.icon" />
        </template>
      </v-list-item>
    </template>
    <template #selection="{ item }">
      <v-list-item
        :title="item.raw.name"
      >
        <template #prepend>
          <span v-if="item.raw.icon" class="mt-1 me-2" v-html="item.raw.icon" />
        </template>
      </v-list-item>
    </template>

    <template #append v-if="store.storeUserIsAdmin">
      <v-btn :icon="mdiPlus" v-tooltip:top="$t('modalTitleAddContainerTypes')" @click="addNewContainerType" />
    </template>
  </v-select>

  <!-- @vue-generic {import('@/plugins/types/stash').ContainerTypes} -->
  <GenericAddEditFormModal
    title="modalTitleAddContainerTypes"
    v-model="newContainerType"
    :fields="addEditFields"
    :notify="sendContainerType"
    ref="addEditModal"
    v-if="newContainerType"
  >
    <template #additional-fields="{ item }">
      <div class="d-flex">
        <v-textarea
          v-model="item.icon"
          :label="$t('formLabelAddContainerTypesIcon')"
          :hint="$t('formPlaceholderAddContainerTypesIcon')"
          persistent-hint
        />
        <div class="icon-wrapper d-flex align-center justify-center">
          <div v-if="item.icon" v-html="item.icon" />
        </div>
      </div>
    </template>
  </GenericAddEditFormModal>
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostContainerType, apiPostContainerTypeTable } from '@/plugins/api/container'
  import type { ContainerTypes } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'
  import { mdiPlus } from '@mdi/js'

  const store = coreStore()

  const model = defineModel<ContainerTypes>()
  const containerTypes = ref<ContainerTypes[]>([])

  const newContainerType = ref<ContainerTypes>()

  const addEditModal = useTemplateRef('addEditModal')

  const addEditFields = computed(() => {
    return [{
      key: 'name',
      title: 'formLabelAddContainerTypesName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'description',
      title: 'formLabelAddContainerTypesDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }]
  })

  function addNewContainerType () {
    newContainerType.value = {
      name: '',
    }

    nextTick(() => addEditModal.value?.show())
  }

  function sendContainerType () {
    return new Promise<boolean>((resolve, reject) => {
      if (newContainerType.value) {
        apiPostContainerType(newContainerType.value, result => {
          newContainerType.value = undefined
          update(result)
          resolve(true)
        })
      } else {
        reject()
      }
    })
  }

  function update (toSelect?: ContainerTypes) {
    apiPostContainerTypeTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      orderBy: 'id',
      ascending: 1,
    }, result => {
      if (result && result.data) {
        containerTypes.value = result.data

        store.setContainerTypes(result.data)

        if (result.data.length > 0) {
          if (toSelect) {
            model.value = result.data.find(p => p.id === toSelect.id)
          } else {
            model.value = result.data[0]
          }
        } else {
          model.value = undefined
        }
      } else {
        containerTypes.value = []
      }
    })
  }

  onMounted(() => {
    update()
  })
</script>

<style scoped>
.icon-wrapper {
  width: 100px;
}
</style>

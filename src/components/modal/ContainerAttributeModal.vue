<template>
  <v-dialog v-model="dialog" fullscreen scrollable>
    <v-card>
      <template #title>
        <div class="d-flex justify-space-between align-center">
          <span>{{ $t('modalTitleContainerAttributes') }}</span>
          <v-btn :icon="mdiClose" variant="text" @click="hide" />
        </div>
      </template>

      <v-card-text>
        <ContainerListItem :container="container" :show-delete="false" />

        <v-btn @click="updateAttributeState" variant="tonal" color="primary" class="mb-3" :prepend-icon="mdiPlus" v-if="store.storeUserIsAdmin" :text="$t('buttonUpdateAttributes')" />

        <ContainerAttributeCard
          class="mb-3"
          v-for="attributes in containerAttibutes"
          :key="`container-attributes-${attributes.id}`"
          :attributes="attributes"
          @delete="deleteAv(attributes.id || -1)"
        />
      </v-card-text>

      <template #actions>
        <v-spacer />
        <v-btn :text="$t('buttonClose')" @click="hide" color="primary" variant="tonal" />
      </template>
    </v-card>
  </v-dialog>

  <!-- @vue-generic {import('@/plugins/types/stash').ContainerAttributeValues} -->
  <GenericAddEditFormModal
    v-model="newAttributeState.attributeValues"
    :fields="newAttributeFields"
    :notify="sendNewAttributeState"
    @items-changed="refresh"
    title="modalTitleUpdateContainerAttributes"
    ref="updateAttributeStateModal"
    v-if="newAttributeState"
  />
</template>

<script setup lang="ts">
  import { apiDeletePostContainerAttributes, apiGetContainerAttributes, apiPostContainerAttributes } from '@/plugins/api/container'
  import { AttributesDatatype, type ContainerAttributes, type ContainerAttributeValues, type ViewTableContainers } from '@/plugins/types/stash'
  import { mdiClose, mdiPlus } from '@mdi/js'
  import type { FieldConfig } from '@/components/modal/GenericAddEditFormModal.vue'
  import { coreStore } from '@/stores/app'

  const compProps = defineProps<{
    container: ViewTableContainers
  }>()

  const containerAttibutes = ref<ContainerAttributes[]>([])

  const dialog = ref(false)
  const store = coreStore()

  const updateAttributeStateModal = useTemplateRef('updateAttributeStateModal')

  const newAttributeState = ref<ContainerAttributes>()
  const newAttributeFields: ComputedRef<FieldConfig<ContainerAttributeValues>[]> = computed(() => {
    return (store.storeContainerAttributes || []).map(a => {
      let dataType

      switch (a.datatype) {
        case AttributesDatatype.date:
          dataType = 'date' as const
          break
        case AttributesDatatype.numeric:
          dataType = 'number' as const
          break
        default:
          dataType = 'text' as const
      }

      return {
        key: `${a.id}`,
        title: a.name,
        type: dataType,
        required: false,
        width: 1,
      }
    })
  })

  function show () {
    dialog.value = true
  }
  function hide () {
    dialog.value = false
  }

  function refresh () {
    update()
    emit('reload-container')
  }

  function deleteAv (containerAttributeValueId: number) {
    apiDeletePostContainerAttributes(compProps.container.containerId || -1, containerAttributeValueId, () => refresh())
  }

  function updateAttributeState () {
    newAttributeState.value = {
      containerId: compProps.container.containerId || -1,
      attributeValues: {},
      createdOn: new Date(),
    }

    nextTick(() => updateAttributeStateModal.value?.show())
  }

  function sendNewAttributeState () {
    return new Promise<boolean>((resolve, reject) => {
      if (newAttributeState.value) {
        apiPostContainerAttributes(compProps.container.containerId || -1, newAttributeState.value, () => {
          resolve(true)
        }).catch(e => reject(e))
      } else {
        reject()
      }
    })
  }

  function update () {
    if (compProps.container) {
      apiGetContainerAttributes(compProps.container.containerId || -1)
        .then(result => {
          if (result && result.data) {
            containerAttibutes.value = result.data
          } else {
            containerAttibutes.value = []
          }
        })
    } else {
      containerAttibutes.value = []
    }
  }

  watch(() => compProps.container, async () => update(), { immediate: true })

  defineExpose({
    show,
    hide,
  })

  const emit = defineEmits(['reload-container'])
</script>

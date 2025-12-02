<template>
  <v-card v-if="container">
    <template #title>
      <div class="d-flex justify-space-between flex-wrap">
        <span>{{ container.containerBarcode }}</span>
        <ContainerTypeChip v-if="container.containerId" color="primary" :container-type="{ name: store.storeContainerTypeMap[container.containerTypeId].name, icon: store.storeContainerTypeMap[container.containerTypeId].icon, description: store.storeContainerTypeMap[container.containerTypeId].description }" />
      </div>
    </template>
    <template #subtitle v-if="containerDescription">
      <span class="text-wrap">{{ containerDescription }}</span>
    </template>

    <template #text v-if="container.containerId">
      <v-row>
        <v-col cols="12" md="6">
          <v-list-item :title="$t('widgetContainerParent')" :subtitle="parentContainer ? undefined : 'N/A'" :prepend-icon="mdiPackageUp">
            <ContainerListItem :show-delete="false" :container="parentContainer" v-if="parentContainer" :parent-click="parentClick" />
          </v-list-item>
        </v-col>
        <v-col cols="12" md="6" v-if="container.projectName">
          <v-list-item :title="$t('widgetContainerProject')" :prepend-icon="mdiNotebook" :subtitle="container.projectName" />
        </v-col>
        <v-col cols="12" md="6" v-if="container.trialName">
          <v-list-item :title="$t('widgetContainerTrial')" :prepend-icon="mdiLandFields" :subtitle="container.trialName" />
        </v-col>
        <v-col cols="12" md="6">
          <v-list-item :title="$t('widgetContainerIsActive')" :prepend-icon="mdiCheckboxMarkedOutline">
            <v-chip label :text="container.containerIsActive" :color="container.containerIsActive ? 'success' : 'warning'" />
          </v-list-item>
        </v-col>
        <v-col cols="12" md="6">
          <v-list-item :title="$t('widgetContainerSubContainerCount')" :subtitle="(container.subContainerCount || 0).toLocaleString()" :prepend-icon="mdiFileTree" />
        </v-col>
      </v-row>
    </template>

    <template #actions v-if="container.containerId">
      <v-spacer />
      <v-btn :text="$t('buttonContainerAttributes')" :prepend-icon="mdiTagText" variant="tonal" @click="containerAttributeModal?.show()" v-if="container.containerAttributes && container.containerAttributes.length > 0" />
      <v-btn :text="$t('buttonContainerTransferHistory')" :prepend-icon="mdiHistory" variant="tonal" @click="containerHistoryModal?.show()" />
      <v-btn :text="$t('buttonContainerContent')" :disabled="(container.subContainerCount || 0) === 0" :prepend-icon="mdiFileTree" variant="tonal" @click="containerTableModal?.show()" />
      <v-btn :text="$t('buttonContainerClear')" :disabled="(container.subContainerCount || 0) === 0" :prepend-icon="mdiCancel" variant="tonal" color="error" v-if="store.storeUserIsAdmin && showClear" @click="clearContainer" />
    </template>

    <ContainerTableModal :container="container" ref="containerTableModal" />
    <ContainerHistoryModal :container="container" ref="containerHistoryModal" />
    <ContainerAttributeModal :container="container" ref="containerAttributeModal" />
  </v-card>
</template>

<script setup lang="ts">
  import { apiGetContainerClear, apiPostContainerTable } from '@/plugins/api/container'
  import { FilterComparator, FilterOperator, type ViewTableContainers } from '@/plugins/types/stash'
  import { getContainerDescription } from '@/plugins/util'
  import { coreStore } from '@/stores/app'
  import { mdiCancel, mdiCheckboxMarkedOutline, mdiFileTree, mdiHistory, mdiLandFields, mdiNotebook, mdiPackageUp, mdiTagText } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  export interface ContainerCardProps {
    parentClick?: () => void
    showClear?: boolean
  }

  const compProps = withDefaults(defineProps<ContainerCardProps>(), {
    showClear: true,
  })

  const { t } = useI18n()

  const container = defineModel<ViewTableContainers>()

  const store = coreStore()

  const containerTableModal = useTemplateRef('containerTableModal')
  const containerHistoryModal = useTemplateRef('containerHistoryModal')
  const containerAttributeModal = useTemplateRef('containerAttributeModal')

  const containerDescription = computed(() => {
    if (container.value) {
      return getContainerDescription(container.value)
    } else {
      return undefined
    }
  })

  const parentContainer: ComputedRef<ViewTableContainers | undefined> = computed(() => {
    if (container.value && container.value.parentId) {
      return {
        containerId: container.value.parentId,
        containerTypeId: container.value.parentContainerTypeId || -1,
        containerBarcode: container.value.parentBarcode || '',
      }
    } else {
      return undefined
    }
  })

  function clearContainer () {
    emitter.emit('show-confirm', {
      title: t('modalTitleClearContainerConfirm'),
      message: t('modalTextClearContainerConfirm'),
      okTitle: t('buttonYes'),
      cancelTitle: t('buttonNo'),
      okVariant: 'error',
      needsConfirmation: true,
      callback: (result: boolean) => {
        if (result === true) {
          apiGetContainerClear(container.value?.containerId || -1, () => refresh())
        }
      },
    })
  }

  function refresh () {
    apiPostContainerTable({
      page: 1,
      limit: 1,
      prevCount: -1,
      filters: [{
        filters: [{
          column: 'containerId',
          comparator: FilterComparator.equals,
          values: [`${container.value?.containerId}`],
        }],
        operator: FilterOperator.or,
      }],
    }, result => {
      if (result && result.data && result.data.length > 0) {
        container.value = result.data[0]
      } else {
        container.value = undefined
      }
    })
  }
</script>

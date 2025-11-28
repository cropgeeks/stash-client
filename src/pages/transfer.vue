<template>
  <v-container>
    <v-card class="mb-5">
      <div class="d-flex flex-nowrap flex-column flex-sm-row justify-space-between align-center ma-5 justify-center">
        <v-card-text class="flex-grow-1">
          <p class="text-h2">{{ $t('pageTransferTitle') }}</p>

          <p class="text-subtitle-1 my-3">{{ $t('pageTransferText') }}</p>
        </v-card-text>
        <v-avatar
          class="ma-3"
          rounded="0"
          size="150"
          image="/img/transfer-between-stashes.svg"
        />
      </div>
    </v-card>

    <v-row>
      <v-col cols="12" md="6">
        <ContainerInput :label="$t('formLabelTransferFrom')" :hint="$t('formDescriptionTransferFrom')" :only-allow-matches="false" v-model="sourceContainer" ref="sourceContainerInput" />
        <ContainerCard :show-clear="false" class="mt-3" :color="sourceContainer.containerId ? undefined : 'warning'" v-model="sourceContainer" v-if="sourceContainer" />
      </v-col>
      <v-col cols="12" md="6">
        <ContainerInput :auto-focus="false" :label="$t('formLabelTransferTo')" :hint="$t('formDescriptionTransferTo')" :only-allow-matches="false" v-model="targetContainer" ref="targetContainerInput" />
        <ContainerCard :show-clear="false" class="mt-3" :color="targetContainer.containerId ? undefined : 'warning'" v-model="targetContainer" v-if="targetContainer" />
      </v-col>
    </v-row>

    <v-alert class="mt-5" :color="clientError.color" variant="tonal" :icon="mdiAlert" :text="$t(clientError.text)" v-if="clientError" />
    <v-btn color="primary" variant="tonal" class="mt-3" :prepend-icon="mdiTransfer" :text="$t('buttonMakeTransfer')" @click="transfer" :disabled="sourceContainer === undefined || targetContainer === undefined || clientError !== undefined" />
    <v-alert class="mt-5" :color="serverError.color" variant="tonal" :icon="mdiAlert" :text="$t(serverError.text)" v-if="serverError" />

    <template v-if="resultCount">
      <v-divider class="my-5" />
      <h3>{{ $t('pageTransferResultTitle') }}</h3>
      <p>{{ $t('pageTransferResultText', resultCount) }}</p>
      <ContainerTransferTable class="mt-3" :get-items="getTransferData" v-if="resultCount" />
    </template>
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostContainerTransfer, apiPostContainerTransferTable } from '@/plugins/api/container'
  import { FilterComparator, FilterOperator, UsersUserType, type PaginatedRequest, type PaginatedResult, type ViewTableContainers, type ViewTableTransfers } from '@/plugins/types/stash'
  import { mdiAlert, mdiTransfer } from '@mdi/js'
  import type { AxiosError } from 'axios'

  import emitter from 'tiny-emitter/instance'

  interface Error {
    color: string
    text: string
  }

  definePage({
    meta: {
      minUserType: UsersUserType.reference,
    },
  })

  const sourceContainer = ref<ViewTableContainers>()
  const targetContainer = ref<ViewTableContainers>()
  const sourceContainerInput = useTemplateRef('sourceContainerInput')
  const targetContainerInput = useTemplateRef('targetContainerInput')

  const resultCount = ref<number>()

  const serverError = ref<Error>()
  const clientError: ComputedRef<Error | undefined> = computed(() => {
    if (!sourceContainer.value || !targetContainer.value) {
      return undefined
    }

    if (sourceContainer.value.containerTypeId !== targetContainer.value.containerTypeId) {
      return {
        text: 'pageTransferErrorIncompatibleTypes',
        color: 'error',
      }
    } else if (sourceContainer.value.containerId === targetContainer.value.containerId) {
      return {
        text: 'pageTransferErrorSameContainer',
        color: 'error',
      }
    } else if (!sourceContainer.value.subContainerCount || sourceContainer.value.subContainerCount < 1) {
      return {
        text: 'pageTransferErrorFromEmpty',
        color: 'error',
      }
    } else {
      return undefined
    }
  })

  function transfer () {
    if (clientError.value !== undefined || !sourceContainer.value || !targetContainer.value) {
      return
    }
    serverError.value = undefined
    resultCount.value = undefined
    emitter.emit('show-loading', true)

    apiPostContainerTransfer({
      sourceId: sourceContainer.value.containerId || -1,
      targetId: targetContainer.value.containerId || -1,
    }, count => {
      emitter.emit('show-loading', false)

      sourceContainerInput.value?.reload()
      targetContainerInput.value?.reload()

      resultCount.value = count
    }, {
      codes: [400, 404, 417],
      callback: (e: AxiosError) => {
        emitter.emit('show-loading', false)
        switch (e.status) {
          case 400:
            // Bad request, some parameter is missing
            serverError.value = {
              text: 'toastErrorMissingParameter',
              color: 'text-danger',
            }
            break
          case 404:
            // Bad request, some parameter is missing
            serverError.value = {
              text: 'pageTransferErrorContainerNotFound',
              color: 'text-danger',
            }
            break
          case 417:
            // Bad request, some parameter is missing
            serverError.value = {
              text: 'toastErrorIncompatibleContainerTypes',
              color: 'text-danger',
            }
            break
        }
      },
    })
  }

  function getTransferData (request: PaginatedRequest) {
    const copy: PaginatedRequest = JSON.parse(JSON.stringify(request))

    if (!copy.filters || copy.filters.length === 0) {
      copy.filters = [{
        filterGroups: [],
        operator: FilterOperator.and,
      }]
    }

    copy.filters[0].filterGroups?.push({
      filters: [{
        column: 'sourceId',
        comparator: FilterComparator.equals,
        values: [`${sourceContainer.value?.containerId}`],
      }, {
        column: 'targetId',
        comparator: FilterComparator.equals,
        values: [`${targetContainer.value?.containerId}`],
      }],
      operator: FilterOperator.and,
    })

    return new Promise<PaginatedResult<ViewTableTransfers[]>>((resolve, reject) => {
      apiPostContainerTransferTable(copy)
        .then(result => resolve(result.data))
        .catch(e => reject(e))
    })
  }

  watch(sourceContainer, async () => {
    resultCount.value = undefined
  })
  watch(targetContainer, async () => {
    resultCount.value = undefined
  })
</script>

<template>
  <v-container>
    <v-card class="mb-5">
      <div class="d-flex flex-nowrap flex-column flex-sm-row justify-space-between align-center ma-5 justify-center">
        <v-card-text class="flex-grow-1">
          <p class="text-h2">{{ $t('pageImportTitle') }}</p>

          <p class="text-subtitle-1 my-3">{{ $t('pageImportText') }}</p>
        </v-card-text>
        <v-avatar
          class="ma-3"
          rounded="0"
          size="150"
          image="/img/transfer-into-stash.svg"
        />
      </div>
    </v-card>

    <ContainerCard class="mt-3" :color="targetContainer.containerId ? undefined : 'warning'" v-model="targetContainer" v-if="targetContainer" />

    <v-stepper
      class="mt-3"
      v-model="stepperIndex"
    >
      <v-stepper-header class="bg-surface-variant">
        <template
          v-for="(step, stepIndex) in steps"
          :key="`step-${stepIndex}`"
        >
          <v-divider v-if="stepIndex > 0" />
          <v-stepper-item
            :title="step"
            color="primary"
            :value="stepIndex + 1"
            :complete="false"
          />
        </template>
      </v-stepper-header>

      <v-stepper-window>
        <v-stepper-window-item :value="1">
          <v-card class="mt-3" :title="$t('')" :subtitle="$t('')">
            <template #text>
              <ContainerInput
                :only-allow-matches="false"
                :label="$t('formLabelImportInto')"
                :hint="$t('formDescriptionImportInto')"
                v-model="targetContainer"
                scan-in-bottom-sheet
              />
            </template>
          </v-card>
        </v-stepper-window-item>
        <v-stepper-window-item :value="2">
          <v-card class="mt-3" :title="$t('')" :subtitle="$t('')">
            <template #text>
              <ContainerInput
                :label="$t('formLabelImportItem')"
                :hint="$t('formDescriptionImportItem')"
                v-model="tempSourceContainer"
                scan-in-bottom-sheet
              />

              <v-list>
                <ContainerListItem show-delete v-for="(item, index) in sourceContainers" :key="`source-container-${item.containerId}`" :container="item" @delete="deleteSourceItem(index)" />
              </v-list>

              <v-alert class="mt-3" color="error" variant="tonal" :icon="mdiAlert" :text="$t(errorMessage)" v-if="errorMessage" />
            </template>
          </v-card>
        </v-stepper-window-item>
      </v-stepper-window>

      <v-stepper-actions class="mt-4">
        <template #prev>
          <v-btn
            :text="$t('buttonPrevious')"
            @click="prev"
            :prepend-icon="mdiArrowLeft"
            :disabled="prevDisabled"
          />
        </template>
        <template #next>
          <v-btn
            :text="$t(stepperIndex === 2 ? 'buttonMove' : 'buttonNext')"
            @click="next"
            :append-icon="mdiArrowRight"
            :color="stepperIndex === 2 ? 'primary' : undefined"
            :disabled="nextDisabled"
          />
        </template>
      </v-stepper-actions>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
  import ContainerListItem from '@/components/container/ContainerListItem.vue'
  import { apiPostContainerImport } from '@/plugins/api/container'
  import { UsersUserType, type ViewTableContainers } from '@/plugins/types/stash'
  import { mdiAlert, mdiArrowLeft, mdiArrowRight } from '@mdi/js'
  import { useI18n } from 'vue-i18n'

  import emitter from 'tiny-emitter/instance'
  import type { AxiosError } from 'axios'

  const { t } = useI18n()

  const stepperIndex = ref(1)
  const targetContainer = ref<ViewTableContainers>()
  const tempSourceContainer = ref<ViewTableContainers>()
  const sourceContainers = ref<ViewTableContainers[]>([])
  const errorMessage = ref<string>()

  definePage({
    meta: {
      minUserType: UsersUserType.reference,
    },
  })

  const steps = computed(() => {
    return [t('pageMoveStepperSelectTarget'), t('pageMoveStepperScanContainers')]
  })

  const prevDisabled = computed(() => {
    if (stepperIndex.value === 1) {
      return true
    }

    return false
  })

  const nextDisabled = computed(() => {
    if (stepperIndex.value === 1 && !targetContainer.value) {
      return true
    }
    if (stepperIndex.value === 2 && (sourceContainers.value || []).length === 0) {
      return true
    }

    return false
  })

  function deleteSourceItem (index: number) {
    sourceContainers.value.splice(index, 1)
  }

  function next () {
    if (stepperIndex.value === 2) {
      moveItems()
    }

    stepperIndex.value = Math.min(steps.value.length, stepperIndex.value + 1)
  }

  function prev () {
    stepperIndex.value = Math.max(1, stepperIndex.value - 1)
  }

  function moveItems () {
    errorMessage.value = undefined

    if (!targetContainer.value) {
      return
    }

    apiPostContainerImport({
      parentContainerId: targetContainer.value.containerId || -1,
      items: sourceContainers.value,
    }, () => {
      emitter.emit('show-snackbar', {
        text: t('toastMessageContainersAdded', sourceContainers.value.length),
        color: 'success',
      })

      sourceContainers.value = []
      targetContainer.value = undefined
      stepperIndex.value = 1
    }, {
      codes: [400, 404],
      callback: (e: AxiosError) => {
        emitter.emit('show-loading', false)
        switch (e.status) {
          case 400:
            // Bad request, some parameter is missing
            errorMessage.value = 'toastErrorMissingParameter'
            break
          case 404:
            // Not found, referenced item not found
            errorMessage.value = 'toastErrorReferencedContainerNotFound'
            break
        }
      },
    })
  }

  watch(targetContainer, async newValue => {
    if (newValue && newValue.containerId) {
      stepperIndex.value = 2
    }
  })
  watch(tempSourceContainer, async newValue => {
    if (newValue) {
      sourceContainers.value.push(newValue)
      nextTick(() => {
        tempSourceContainer.value = undefined
      })
    }
  })
</script>

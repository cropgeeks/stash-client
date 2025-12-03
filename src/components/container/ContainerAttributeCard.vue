<template>
  <v-card v-if="attributes">
    <template #title>
      <div class="d-flex justify-space-between flex-wrap">
        <span>{{ $t('widgetContainerAttributesTitle') }}</span>
        <v-chip label :text="new Date(attributes.createdOn || new Date()).toLocaleDateString()" />
      </div>
    </template>

    <v-row class="mb-1">
      <v-col
        cols="12" sm="6" md="4" lg="3"
        v-for="(value, key) in attributes.attributeValues"
        :key="`attribute-value-${attributes.id}-${key}`"
      >
        <v-list-item
          :subtitle="value"
        >
          <template #title>
            <span class="text-wrap">{{ store.storeContainerAttributeMap[+key]?.name }}</span>
          </template>
        </v-list-item>
      </v-col>
    </v-row>

    <template #actions v-if="store.storeUserIsAdmin">
      <v-spacer />
      <v-btn v-if="store.storeUserIsAdmin" :prepend-icon="mdiDelete" color="error" variant="tonal" @click="askForConfirmation" :text="$t('buttonDelete')" />
    </template>
  </v-card>
</template>

<script setup lang="ts">
  import type { ContainerAttributes } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'
  import { mdiDelete } from '@mdi/js'

  import emitter from 'tiny-emitter/instance'
  import { useI18n } from 'vue-i18n'

  const compProps = defineProps<{
    attributes: ContainerAttributes
  }>()

  const { t } = useI18n()
  const store = coreStore()

  function askForConfirmation () {
    emitter.emit('show-confirm', {
      title: t('modalTitleDeleteContainerAttributesConfirm'),
      message: t('modalTextDeleteContainerAttributesConfirm'),
      okTitle: t('buttonYes'),
      cancelTitle: t('buttonNo'),
      okVariant: 'error',
      needsConfirmation: true,
      callback: (result: boolean) => {
        if (result === true) {
          emit('delete')
        }
      },
    })
  }

  const emit = defineEmits(['delete'])
</script>

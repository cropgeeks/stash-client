<template>
  <v-container>
    <v-card class="mb-5">
      <div class="d-flex flex-nowrap flex-column flex-sm-row justify-space-between align-center ma-5 justify-center">
        <v-card-text class="flex-grow-1">
          <p class="text-h2">{{ $t('appTitle') }}</p>

          <p class="text-h5 my-3">{{ $t('pageHomeWelcome') }}</p>

          <p class="text-subtitle-1 my-3">{{ $t('pageHomeInstructions') }}</p>
        </v-card-text>
        <v-img
          class="ma-3 flex-grow-0"
          height="200"
          min-width="230"
          src="/img/stash-w-text-shapes-dark.svg"
          v-if="store.storeIsDarkMode"
        />
        <v-img
          class="ma-3 flex-grow-0"
          height="200"
          min-width="230"
          src="/img/stash-w-text-shapes.svg"
          v-else
        />
      </div>
    </v-card>

    <section>
      <v-row>
        <v-col cols="12" class="mb-3">
          <v-card class="h-100" :title="$t('pageHomeCardSearchTitle')" :sub-title="$t('pageHomeCardSearchSubtitle')">
            <template #text>
              <ContainerInput
                :label="$t('pageHomeCardSearchTitle')"
                :hint="$t('pageHomeCardSearchSubtitle')"
                :only-allow-matches="false"
                tts-include-description
                v-model="searchContainer"
              />

              <template v-if="searchContainer">
                <ContainerCard class="mt-3" v-model="searchContainer" :parent-click="selectContainer" />
              </template>
            </template>
          </v-card>
        </v-col>
        <template v-if="store.storeUserIsRegular">
          <v-col cols="12" md="4" class="mb-3">
            <v-card class="h-100" to="/import">
              <v-img
                max-height="350px"
                src="/img/predefine-containers.svg"
              />
              <v-card-title>{{ $t('pageHomeCardPredefineTitle') }}</v-card-title>
              <v-card-subtitle>
                <span class="text-wrap">{{ $t('pageHomeCardPredefineSubtitle') }}</span>
              </v-card-subtitle>

              <v-card-actions>
                <v-spacer />
                <v-btn variant="tonal" color="primary" to="/import" :text="$t('buttonSelect')" />
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-3">
            <v-card class="h-100" to="/move">
              <v-img
                max-height="350px"
                src="/img/transfer-into-stash.svg"
              />
              <v-card-title>{{ $t('pageHomeCardImportTitle') }}</v-card-title>
              <v-card-subtitle>
                <span class="text-wrap">{{ $t('pageHomeCardImportSubtitle') }}</span>
              </v-card-subtitle>

              <v-card-actions>
                <v-spacer />
                <v-btn variant="tonal" color="primary" to="/move" :text="$t('buttonSelect')" />
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col cols="12" md="4" class="mb-3">
            <v-card class="h-100" to="/transfer">
              <v-img
                max-height="350px"
                src="/img/transfer-between-stashes.svg"
              />
              <v-card-title>{{ $t('pageHomeCardTransferTitle') }}</v-card-title>
              <v-card-subtitle>
                <span class="text-wrap">{{ $t('pageHomeCardTransferSubtitle') }}</span>
              </v-card-subtitle>

              <v-card-actions>
                <v-spacer />
                <v-btn variant="tonal" color="primary" to="/transfer" :text="$t('buttonSelect')" />
              </v-card-actions>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </section>
  </v-container>
</template>

<script lang="ts" setup>
  import { apiPostContainerTable } from '@/plugins/api/container'
  import { FilterComparator, FilterOperator, type ViewTableContainers } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'

  const store = coreStore()

  const searchContainer = ref<ViewTableContainers>()

  function selectContainer () {
    apiPostContainerTable({
      page: 1,
      limit: 1,
      prevCount: -1,
      filters: [{
        operator: FilterOperator.or,
        filters: [{
          column: 'containerId',
          comparator: FilterComparator.equals,
          values: [`${searchContainer.value?.parentId}`],
        }],
      }],
    }, result => {
      if (result && result.data && result.data.length > 0) {
        searchContainer.value = result.data[0]
      }
    })
  }
</script>

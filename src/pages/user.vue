<template>
  <v-container>
    <h1>{{ $t('pageUserTitle') }}</h1>
    <p>{{ $t('pageUserText') }}</p>

    <v-btn-toggle
      v-model="selectedUserType"
      class="mb-3"
      variant="tonal"
      color="primary"
    >
      <v-btn
        v-for="type in userTypeConfig"
        :key="`container-type-${type.key}`"
        :value="type.key"
        :text="$t(type.text)"
      >
        <template #prepend v-if="type.icon"><v-icon :icon="type.icon" /></template>
      </v-btn>
    </v-btn-toggle>

    <UserTable :get-items="getUsers" ref="userTable" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostUserTable } from '@/plugins/api/user'
  import { userTypeConfig } from '@/plugins/constants'
  import { FilterComparator, FilterOperator, UsersUserType, type PaginatedRequest, type PaginatedResult, type ViewTableUsers } from '@/plugins/types/stash'

  definePage({
    meta: {
      minUserType: UsersUserType.admin,
    },
  })

  const selectedUserType = ref<string>()
  const userTable = useTemplateRef('userTable')

  function getUsers (request: PaginatedRequest) {
    const copy: PaginatedRequest = JSON.parse(JSON.stringify(request))

    if (!copy.filters || !copy.filters[0]) {
      copy.filters = [{
        operator: FilterOperator.and,
        filters: [],
      }]
    }

    if (!copy.filters[0].filters) {
      copy.filters[0].filters = []
    }

    if (selectedUserType.value) {
      copy.filters[0].filters?.push({
        column: 'userType',
        comparator: FilterComparator.inSet,
        values: [selectedUserType.value],
      })
    }

    return new Promise<PaginatedResult<ViewTableUsers[]>>((resolve, reject) => {
      apiPostUserTable(copy)
        .then(result => resolve(result.data))
        .catch(e => reject(e))
    })
  }

  watch(selectedUserType, async () => userTable.value?.refresh())
</script>

<template>
  <v-container>
    <h1>{{ $t('pageUserTitle') }}</h1>
    <p>{{ $t('pageUserText') }}</p>

    <UserTable :get-items="getUsers" />
  </v-container>
</template>

<script setup lang="ts">
  import { apiPostUserTable } from '@/plugins/api/user'
  import { UsersUserType, type PaginatedRequest, type PaginatedResult, type ViewTableUsers } from '@/plugins/types/stash'

  definePage({
    meta: {
      minUserType: UsersUserType.admin,
    },
  })

  function getUsers (request: PaginatedRequest) {
    return new Promise<PaginatedResult<ViewTableUsers[]>>((resolve, reject) => {
      apiPostUserTable(request)
        .then(result => resolve(result.data))
        .catch(e => reject(e))
    })
  }
</script>

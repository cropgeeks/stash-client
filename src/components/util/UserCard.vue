<template>
  <v-card v-if="user">
    <template #text>
      <v-row>
        <v-col cols="12" md="4">
          <CustomAvatar size="8em" :user="{ id: user.id || -1, name: user.name || '' }" />
        </v-col>
        <v-col cols="12" md="8">
          <v-card-title class="pb-0">{{ user.name }}</v-card-title>
          <v-card-subtitle>{{ user.emailAddress }}</v-card-subtitle>

          <v-card-text>
            <v-chip label :text="$t(userTypeConfig[user.userType || ''].text)" :color="userTypeConfig[user.userType || ''].color" :prepend-icon="userTypeConfig[user.userType || ''].icon" />
          </v-card-text>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script setup lang="ts">
  import { userTypeConfig } from '@/plugins/constants'
  import type { ViewTableUsers } from '@/plugins/types/stash'

  const compProps = defineProps<{
    user: ViewTableUsers
  }>()
</script>

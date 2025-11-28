<template>
  <v-container>
    <div class="d-flex flex-column align-center justify-center">
      <v-card
        class="mx-auto pa-12 pb-8"
        elevation="8"
        min-width="max(33vw, 300px)"
        max-width="640"
        rounded="lg"
        :loading="loading"
      >
        <template #loader="{ isActive }">
          <v-progress-linear
            :active="isActive"
            color="primary"
            height="4"
            indeterminate
          />
        </template>
        <LoginSection v-model:loading="loading" />
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
  const loading = ref(false)
</script>

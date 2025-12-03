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

    <p>{{ $t('pageAboutParagraphOne') }}</p>

    <!-- Funders -->
    <h2>{{ $t('pageAboutStashFundersTitle') }}<small> - {{ $t('pageAboutStashFundersSubtitle') }}</small></h2>
    <p>{{ $t('pageAboutStashFundersText') }}</p>

    <v-row class="funders">
      <v-col v-for="(funder, i) in funders" :key="'about-funders-' + i" class="text-center pb-5 col-xxl-2">
        <div class="pa-3 pa-xl-4 img-container">
          <a :href="funder.href" :title="funder.name" target="_blank" rel="noopener noreferrer" v-if="funder.href">
            <v-img height="125" min-width="200" :src="`./img/funders/${funder.logo}`" alt="Funder logo" />
          </a>
          <v-img height="125" :src="`./img/funders/${funder.logo}`" alt="Funder logo" v-else />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { coreStore } from '@/stores/app'

  const store = coreStore()

  interface Funder {
    name: string
    href?: string
    logo: string
  }

  const funders = ref<Funder[]>([
    {
      name: 'The James Hutton Institute',
      href: 'http://www.hutton.ac.uk/',
      logo: 'hutton.svg',
    },
    {
      name: 'The Scottish Government',
      href: 'https://www.gov.scot/',
      logo: 'scottish-government.svg',
    },
    {
      name: 'International Barley Hub',
      href: 'http://www.barleyhub.org/',
      logo: 'ibh.svg',
    },
  ])
</script>

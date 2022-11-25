<template>
  <div>
    <section class="about-header bg-light p-5 mb-4 border">
      <b-row>
        <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
          <b-img fluid src="img/stash.svg" alt="Stash logo" />
        </b-col>
        <b-col cols=12 md=8 order="2" order-md="1">
          <h1 class="display-4 text-center text-md-left">{{ $t('appTitle') }}</h1>
          <p class="lead text-center text-md-left">{{ $t('pageHomeWelcome') }}</p>
          <p class="text-center text-md-left mb-0">{{ $t('pageHomeInstructions') }}</p>
        </b-col>
      </b-row>
    </section>
    <section>
      <b-row>
        <b-col cols=12 md=4 class="mb-3">
          <b-card class="h-100" :img-src="require('@/assets/img/transfer-between-stashes.svg')" :title="$t('pageHomeCardTransferTitle')" :sub-title="$t('pageHomeCardTransferSubtitle')">
            <router-link :to="{ name: 'transfer' }" class="stretched-link"></router-link>
          </b-card>
        </b-col>
      </b-row>
    </section>
  </div>
</template>

<script>
export default {
}
</script>

<style scoped>
.about-header img {
  max-height: 125px;
}

@media (min-width: 768px) {
  .about-header img {
    max-height: 150px;
  }
}
</style>

<template>
  <div>
    <section class="page-header bg-light p-5 mb-4 border">
      <b-row>
        <b-col cols=12 md=4 class="text-center text-md-right" order="1" order-md="2">
          <b-img fluid :src="require('@/assets/img/predefine-containers.svg')" alt="Predefine image" />
        </b-col>
        <b-col cols=12 md=8 order="2" order-md="1">
          <h1 class="display-4 text-center text-md-left">{{ $t('pagePredefineTitle') }}</h1>
          <p class="lead text-center text-md-left">{{ $t('pagePredefineText') }}</p>
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

</style>

<template>
  <div>
    <h1>{{ $t('pageUserTitle') }}</h1>
    <p>{{ $t('pageUserText') }}</p>

    <UserTable :getData="getData" />
  </div>
</template>

<script>
import UserTable from '@/components/tables/UserTable'
import { apiPostUserTable } from '@/plugins/api/user'

export default {
  components: {
    UserTable
  },
  methods: {
    getData: function (page, limit, prevCount) {
      return apiPostUserTable({
        page: page,
        limit: limit,
        prevCount: prevCount
      })
    }
  }
}
</script>

<style>

</style>

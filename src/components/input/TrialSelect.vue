<template>
  <v-autocomplete
    v-model="model"
    return-object
    :disabled="!project"
    item-value="id"
    item-title="name"
    :label="$t('formLabelImportTrial')"
    :hint="$t('formDescriptionImportTrial')"
    persistent-hint
    clearable
    :items="trials"
  >
    <template #append v-if="store.storeUserIsAdmin">
      <v-btn :icon="mdiPlus" :disabled="!project" v-tooltip:top="$t('modalTitleAddTrial')" @click="addNewTrial" />
    </template>
  </v-autocomplete>

  <!-- @vue-generic {import('@/plugins/types/stash').Trials} -->
  <GenericAddEditFormModal
    title="modalTitleAddTrial"
    v-model="newTrial"
    :fields="addEditFields"
    :notify="sendTrial"
    ref="addEditModal"
    v-if="newTrial"
  />
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostTrial, apiPostTrialTable } from '@/plugins/api/trial'
  import { apiPostUserTable } from '@/plugins/api/user'
  import { FilterComparator, FilterOperator, type Projects, type Trials, type ViewTableUsers } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'
  import { mdiPlus } from '@mdi/js'

  const store = coreStore()

  const compProps = defineProps<{
    project?: Projects
    autoSelectFirst: boolean
  }>()

  const model = defineModel<Trials>()
  const trials = ref<Trials[]>([])

  const newTrial = ref<Trials>()
  const users = ref<ViewTableUsers[]>([])

  const addEditModal = useTemplateRef('addEditModal')

  const addEditFields = computed(() => {
    return [{
      key: 'name',
      title: 'formLabelAddTrialName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'description',
      title: 'formLabelAddTrialDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }, {
      key: 'userId',
      title: 'formLabelAddTrialUser',
      type: 'autocomplete' as const,
      required: true,
      width: 2,
      selectOptions: users.value?.map(u => {
        return {
          value: u.id,
          title: `${u.name} (${u.userType})`,
        }
      }),
    }, {
      key: 'startDate',
      title: 'formLabelAddTrialStartDate',
      type: 'dateobject' as const,
      required: false,
      width: 1,
    }, {
      key: 'endDate',
      title: 'formLabelAddTrialEndDate',
      type: 'dateobject' as const,
      required: false,
      width: 1,
    }]
  })

  function addNewTrial () {
    newTrial.value = {
      name: '',
      projectId: compProps.project?.id || -1,
      userId: compProps.project?.userId || ((users.value && users.value.length > 0) ? users.value[0].id : undefined),
    }

    nextTick(() => addEditModal.value?.show())
  }

  function sendTrial () {
    return new Promise<boolean>((resolve, reject) => {
      if (newTrial.value) {
        apiPostTrial(newTrial.value, result => {
          newTrial.value = undefined
          update(result)
          resolve(true)
        })
      } else {
        reject()
      }
    })
  }

  function update (toSelect?: Trials) {
    apiPostTrialTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      orderBy: 'name',
      ascending: 1,
      filters: [{
        operator: FilterOperator.and,
        filters: [{
          column: 'projectId',
          comparator: FilterComparator.equals,
          values: [`${compProps.project?.id}`],
        }],
      }],
    }, result => {
      if (result && result.data) {
        trials.value = result.data

        if (result.data.length > 0) {
          if (toSelect) {
            model.value = result.data.find(p => p.id === toSelect.id)
          } else if (compProps.autoSelectFirst) {
            model.value = result.data[0]
          }
        } else {
          model.value = undefined
        }
      } else {
        trials.value = []
        model.value = undefined
      }
    })
  }

  function getUsers () {
    apiPostUserTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      orderBy: 'name',
      ascending: 1,
    }, result => {
      if (result && result.data && result.data.length > 0) {
        users.value = result.data
      } else {
        users.value = []
      }
    })
  }

  watch(() => compProps.project, async () => update())

  onMounted(() => {
    update()
    getUsers()
  })
</script>

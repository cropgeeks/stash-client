<template>
  <v-autocomplete
    v-model="model"
    return-object
    item-value="id"
    item-title="name"
    :label="$t('formLabelImportProject')"
    :hint="$t('formDescriptionImportProject')"
    persistent-hint
    clearable
    :items="projects"
  >
    <template #append v-if="store.storeUserIsAdmin">
      <v-btn :icon="mdiPlus" v-tooltip:top="$t('modalTitleAddProject')" @click="addNewProject" />
    </template>
  </v-autocomplete>

  <!-- @vue-generic {import('@/plugins/types/stash').Projects} -->
  <GenericAddEditFormModal
    title="modalTitleAddProject"
    v-model="newProject"
    :fields="addEditFields"
    :notify="sendProject"
    ref="addEditModal"
    v-if="newProject"
  />
</template>

<script setup lang="ts">
  import { MAX_JAVA_INTEGER } from '@/plugins/api/base'
  import { apiPostProject, apiPostProjectTable } from '@/plugins/api/project'
  import { apiPostUserTable } from '@/plugins/api/user'
  import type { Projects, ViewTableUsers } from '@/plugins/types/stash'
  import { coreStore } from '@/stores/app'
  import { mdiPlus } from '@mdi/js'

  const compProps = defineProps<{
    autoSelectFirst: boolean
  }>()

  const store = coreStore()

  const model = defineModel<Projects>()
  const projects = ref<Projects[]>([])

  const newProject = ref<Projects>()
  const users = ref<ViewTableUsers[]>([])

  const addEditModal = useTemplateRef('addEditModal')

  const addEditFields = computed(() => {
    return [{
      key: 'name',
      title: 'formLabelAddProjectName',
      type: 'text' as const,
      required: true,
      width: 2,
      valid: (value: string) => value !== undefined && value !== null && value.trim().length > 0,
    }, {
      key: 'description',
      title: 'formLabelAddProjectDescription',
      type: 'textarea' as const,
      required: false,
      width: 2,
    }, {
      key: 'userId',
      title: 'formLabelAddProjectUser',
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
      title: 'formLabelAddProjectStartDate',
      type: 'dateobject' as const,
      required: false,
      width: 1,
    }, {
      key: 'endDate',
      title: 'formLabelAddProjectEndDate',
      type: 'dateobject' as const,
      required: false,
      width: 1,
    }]
  })

  function addNewProject () {
    newProject.value = {
      name: '',
      userId: (users.value && users.value.length > 0) ? users.value[0].id : undefined,
    }

    nextTick(() => addEditModal.value?.show())
  }

  function sendProject () {
    return new Promise<boolean>((resolve, reject) => {
      if (newProject.value) {
        apiPostProject(newProject.value, result => {
          newProject.value = undefined
          update(result)
          resolve(true)
        })
      } else {
        reject()
      }
    })
  }

  function update (toSelect?: Projects) {
    apiPostProjectTable({
      page: 1,
      limit: MAX_JAVA_INTEGER,
      orderBy: 'name',
      ascending: 1,
    }, result => {
      if (result && result.data) {
        projects.value = result.data

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
        projects.value = []
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

  onMounted(() => {
    update()
    getUsers()
  })
</script>

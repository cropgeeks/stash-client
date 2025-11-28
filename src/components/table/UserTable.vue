<template>
  <v-text-field
    v-model="searchTerm"
    type="search"
    :prepend-inner-icon="mdiMagnify"
    :label="$t('formLabelUserSearch')"
    :append-inner-icon="mdiArrowRight"
    @click:append-inner="runSearch"
    @keyup.enter="runSearch"
    clearable
    @click:clear="runSearch"
    hide-details
  />
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :loading="loading"
    striped="odd"
    hover
    :search="search"
    item-value="userId"
    @update:options="loadItems"
  >
    <template #item.icon="{ item }">
      <CustomAvatar :user="{ id: item.id, name: item.name }" :search-params="{ timestamp: apiCallTimestamp }" />
    </template>
    <template #item.userType="{ item }">
      <v-chip class="w-100" label :text="$t(userTypeConfig[item.userType].text)" :color="userTypeConfig[item.userType].color" :prepend-icon="userTypeConfig[item.userType].icon" />
    </template>
    <template #item.stats="{ item }">
      <v-sparkline
        v-if="userStats[item.id]"
        :model-value="userStats[item.id].map(v => v.value)"
        line-width="2"
        type="trend"
        fill
        color="primary"
      />
    </template>
    <template #item.actions="{ item }">
      <v-btn-group density="compact">
        <v-btn class="px-5" :icon="mdiPencil" @click="editUser(item)" v-tooltip:top="$t('modalTitleEditUser')" />
        <v-btn class="px-5" :icon="mdiKeyChange" @click="editPassword(item)" v-tooltip:top="$t('dropdownChangePassword')" />
        <v-btn class="px-5" :icon="mdiImagePlus" @click="editUserImage(item)" v-tooltip:top="$t('modalTitleUploadUserImage')" />
        <v-btn class="px-5" :icon="mdiDelete" @click="deleteUser(item)" color="error" v-tooltip:top="$t('modalTitleConfirmDeleteUser')" />
      </v-btn-group>
    </template>
  </v-data-table-server>

  <!-- @vue-generic {import('@/plugins/types/stash').BasicUser} -->
  <GenericAddEditFormModal
    :title="selectedItem.id ? 'modalTitleEditUser' : 'modalTitleAddUser'"
    v-model="selectedItem"
    :notify="onSendUser"
    :fields="userFields"
    :max-width="640"
    @items-changed="refresh"
    ref="userModal"
    v-if="selectedItem"
  >
    <template #prepend v-if="selectedItem.id">
      <UserCard :user="{ id: selectedItem.id || -1, name: selectedItem.name || '', userType: selectedItem.userType, emailAddress: selectedItem.emailAddress || '' }" />
    </template>
  </GenericAddEditFormModal>

  <!-- @vue-generic {import('@/components/table/UserTable.vue').ImageHolder} -->
  <GenericAddEditFormModal
    title="modalTitleUploadUserImage"
    v-model="imageUploadTemp"
    :notify="onUploadUserImage"
    :fields="userImageFields"
    :max-width="640"
    @items-changed="refresh"
    ref="userImageModal"
    v-if="imageUploadTemp"
  >
    <template #prepend v-if="imageUploadTempData">
      <v-img max-height="50vh" :src="imageUploadTempData" />
    </template>
  </GenericAddEditFormModal>

  <!-- @vue-generic {import('@/components/table/UserTable.vue').PasswordUpdate} -->
  <GenericAddEditFormModal
    title="modalTitleChangePassword"
    v-model="userPasswordUpdate"
    :notify="onUpdateUserPassword"
    :fields="userPasswordFields"
    :max-width="640"
    @items-changed="refresh"
    ref="userPasswordModal"
    v-if="userPasswordUpdate"
  />

  <v-btn :prepend-icon="mdiAccountPlus" color="primary" variant="tonal" :text="$t('buttonAddUser')" @click="editUser(undefined)" />
</template>

<script setup lang="ts">
  import { type ViewTableUsers, type PaginatedRequest, type PaginatedResult, type FilterGroup, FilterComparator, FilterOperator, UsersUserType, type BasicUser, type UserPasswordUpdate } from '@/plugins/types/stash'
  import { mdiAccountPlus, mdiArrowRight, mdiDelete, mdiImagePlus, mdiKeyChange, mdiMagnify, mdiPencil } from '@mdi/js'
  import { useI18n } from 'vue-i18n'
  import type { DataTableSortItem } from 'vuetify'
  import type { FieldConfig } from '@/components/modal/GenericAddEditFormModal.vue'
  import { userTypeConfig } from '@/plugins/constants'
  import { apiDeleteUser, apiPatchUser, apiPatchUserPasswordForced, apiPostUser, apiPostUserImage } from '@/plugins/api/user'

  import emitter from 'tiny-emitter/instance'
  import type { AxiosError } from 'axios'

  const compProps = defineProps<{
    getItems: (request: PaginatedRequest) => Promise<PaginatedResult<ViewTableUsers[]>>
  }>()

  interface MonthlyStats {
    name: string
    value: number
  }
  export interface ImageHolder {
    userId: number
    imageFile: File | undefined
  }
  export interface PasswordUpdate {
    userId: number
    password: string | undefined
    passwordConfirm: string | undefined
  }

  const { t } = useI18n()

  const search = ref<string>()
  const searchTerm = ref<string>()
  const itemsPerPage = ref(10)
  const loading = ref(false)
  const serverItems = ref<ViewTableUsers[]>([])
  const totalItems = ref(0)
  const date = ref<Date>(new Date())
  const userStats = ref<{ [index: number]: MonthlyStats[] }>({})
  const filters = ref<FilterGroup[]>([])
  const selectedItem = ref<BasicUser>()
  const imageUploadTemp = ref<ImageHolder>()
  const imageUploadTempData = ref<string>()
  const apiCallTimestamp = ref<string>()
  const userPasswordUpdate = ref<PasswordUpdate>()

  const userModal = useTemplateRef('userModal')
  const userImageModal = useTemplateRef('userImageModal')
  const userPasswordModal = useTemplateRef('userPasswordModal')

  const yearMonths = computed(() => {
    if (date.value) {
      const result = [date.value.toISOString().slice(0, 7)]
      for (let i = 1; i < 12; i++) {
        date.value.setMonth(date.value.getMonth() - 1)
        result.unshift(date.value.toISOString().slice(0, 7))
      }

      return result
    } else {
      return []
    }
  })

  const userTypes = computed(() => {
    return Object.values(userTypeConfig.value).map(v => {
      return {
        title: t(v.text),
        value: v.key,
      }
    })
  })

  const userImageFields: ComputedRef<FieldConfig<ImageHolder>[]> = computed(() => {
    return [{
      key: 'imageFile',
      title: 'formLabelUserImage',
      type: 'file' as const,
      required: true,
      width: 2,
      accepts: '.jpeg, .png, .jpg',
    }]
  })

  const userPasswordFields: ComputedRef<FieldConfig<PasswordUpdate>[]> = computed(() => {
    return [{
      key: 'password',
      title: 'formLabelChangePasswordNewPassword',
      type: 'password' as const,
      required: true,
      width: 2,
      valid: () => userPasswordUpdate.value?.password !== undefined && userPasswordUpdate.value?.password !== '' && userPasswordUpdate.value?.password === userPasswordUpdate.value?.passwordConfirm,
    }, {
      key: 'passwordConfirm',
      title: 'formLabelChangePasswordNewPasswordConfirm',
      type: 'password' as const,
      required: true,
      width: 2,
      valid: () => userPasswordUpdate.value?.password !== undefined && userPasswordUpdate.value?.password !== '' && userPasswordUpdate.value?.password === userPasswordUpdate.value?.passwordConfirm,
    }]
  })

  const userFields: ComputedRef<FieldConfig<BasicUser>[]> = computed(() => {
    return [{
      key: 'name',
      title: 'formLabelUserName',
      type: 'text' as const,
      required: true,
      width: 2,
    }, {
      key: 'emailAddress',
      title: 'formLabelUserEmail',
      type: 'text' as const,
      required: true,
      width: 2,
      disabled: selectedItem.value?.id !== undefined,
    }, {
      key: 'password',
      title: 'formLabelUserPassword',
      type: 'password' as const,
      required: selectedItem.value?.userType !== UsersUserType.reference,
      width: 2,
      disabled: selectedItem.value?.userType === UsersUserType.reference || selectedItem.value?.id !== undefined,
    }, {
      key: 'userType',
      title: 'formLabelUserType',
      type: 'select' as const,
      required: true,
      width: 2,
      selectOptions: userTypes.value,
    }]
  })

  const headers = computed(() => {
    return [{
      key: 'icon',
      sortable: false,
      title: t('tableColumnUserIcon'),
    }, {
      key: 'name',
      title: t('tableColumnUserName'),
    }, {
      key: 'emailAddress',
      title: t('tableColumnUserEmailAddress'),
    }, {
      key: 'userType',
      title: t('tableColumnUserType'),
    }, {
      key: 'stats',
      sortable: false,
      title: t('tableColumnUserStats'),
    }, {
      key: 'lastLogin',
      title: t('tableColumnUserLastLogin'),
      value: (value: ViewTableUsers) => value.createdOn ? new Date(value.createdOn).toLocaleString() : undefined,
    }, {
      key: 'createdOn',
      title: t('tableColumnUserCreatedOn'),
      value: (value: ViewTableUsers) => value.createdOn ? new Date(value.createdOn).toLocaleString() : undefined,
    }, {
      key: 'actions',
      sortable: false,
      title: t('tableColumnUserActions'),
    }]
  })

  watch(imageUploadTemp, async newValue => {
    if (newValue && newValue.imageFile) {
      imageUploadTempData.value = await toBase64(newValue.imageFile as File)
    } else {
      imageUploadTempData.value = undefined
    }
  }, { deep: true })

  function toBase64 (file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.addEventListener('load', () => resolve(reader.result as string))
      reader.addEventListener('error', error => reject(error))
    })
  }

  function onSendUser () {
    return new Promise<boolean>((resolve, reject) => {
      if (selectedItem.value) {
        if (selectedItem.value.id) {
          apiPatchUser(selectedItem.value, () => resolve(true))
        } else {
          apiPostUser(selectedItem.value, () => resolve(true))
        }
      } else {
        reject()
      }
    })
  }

  function onUpdateUserPassword () {
    return new Promise<boolean>((resolve, reject) => {
      if (userPasswordUpdate.value && userPasswordUpdate.value.userId && userPasswordUpdate.value.password && userPasswordUpdate.value.passwordConfirm && userPasswordUpdate.value.password === userPasswordUpdate.value.passwordConfirm) {
        apiPatchUserPasswordForced(userPasswordUpdate.value.userId, {
          newPassword: userPasswordUpdate.value.password,
        }, () => {
          resolve(true)
        })
      } else {
        reject()
      }
    })
  }

  function onUploadUserImage () {
    return new Promise<boolean>((resolve, reject) => {
      if (!imageUploadTemp.value || !imageUploadTemp.value.imageFile) {
        reject()
      } else {
        const formData = new FormData()
        formData.append('image', imageUploadTemp.value.imageFile)

        emitter.emit('show-loading', true)

        apiPostUserImage(imageUploadTemp.value.userId, formData, () => {
          emitter.emit('show-loading', false)
          apiCallTimestamp.value = `${Date.now()}`
          imageUploadTemp.value = undefined
          imageUploadTempData.value = undefined
          resolve(true)
        }, {
          codes: [400, 404, 413],
          callback: (e: AxiosError) => {
            emitter.emit('show-loading', false)
            reject(e)
          },
        })
      }
    })
  }

  function refresh () {
    totalItems.value = 0
    search.value = `${Date.now()}`
  }

  function runSearch () {
    const trimmed = searchTerm.value?.trim() || ''
    totalItems.value = 0

    if (trimmed.length === 0) {
      filters.value = []
    } else {
      filters.value = [{
        filterGroups: [{
          filters: [{
            column: 'name',
            comparator: FilterComparator.contains,
            values: [trimmed],
          }, {
            column: 'emailAddress',
            comparator: FilterComparator.contains,
            values: [trimmed],
          }],
          operator: FilterOperator.or,
        }],
        operator: FilterOperator.and,
      }]
    }

    nextTick(() => {
      search.value = `${Date.now()}`
    })
  }

  function deleteUser (user: ViewTableUsers) {
    emitter.emit('show-confirm', {
      title: t('modalTitleConfirmDeleteUser'),
      message: t('modalTextConfirmDeleteUser'),
      okTitle: t('buttonYes'),
      cancelTitle: t('buttonNo'),
      okVariant: 'error',
      callback: (result: boolean) => {
        if (result === true) {
          apiDeleteUser(user.id).then(() => refresh())
        }
      },
    })
  }

  function editUser (user: ViewTableUsers | undefined) {
    selectedItem.value = user
      ? {
        id: user.id,
        name: user.name,
        emailAddress: user.emailAddress,
        password: undefined,
        userType: user.userType,
      }
      : { userType: UsersUserType.regular }

    nextTick(() => userModal.value?.show())
  }

  function editUserImage (user: ViewTableUsers) {
    imageUploadTemp.value = {
      userId: user.id,
      imageFile: undefined,
    }

    nextTick(() => userImageModal.value?.show())
  }

  function editPassword (user: ViewTableUsers) {
    userPasswordUpdate.value = {
      userId: user.id,
      password: undefined,
      passwordConfirm: undefined,
    }

    nextTick(() => userPasswordModal.value?.show())
  }

  function loadItems ({ page, itemsPerPage, sortBy }: { page: number, itemsPerPage: number, sortBy?: DataTableSortItem[] }) {
    loading.value = true
    userStats.value = {}

    compProps.getItems({
      page: page,
      limit: itemsPerPage,
      prevCount: totalItems.value || -1,
      orderBy: (sortBy && sortBy.length > 0) ? sortBy[0].key : undefined,
      ascending: (sortBy && sortBy.length > 0) ? (sortBy[0].order === 'asc' ? 1 : 0) : undefined,
      filters: filters.value,
    }).then(result => {
      if (result && result.data) {
        serverItems.value = result.data
        totalItems.value = result.count
        loading.value = false

        result.data.forEach(user => {
          userStats.value[user.id || -1] = yearMonths.value.map(ym => {
            return {
              name: ym,
              value: (user.stats && user.stats[ym]) ? user.stats[ym] : 0,
            }
          })
        })
      }
    })
  }
</script>

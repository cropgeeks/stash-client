<template>
  <v-dialog v-model="dialog" :max-width="`min(90vw, ${maxWidth}px)`">
    <v-card
      :title="$t(compProps.title)"
    >
      <template #text v-if="formModel !== undefined && formModel !== null">
        <slot name="prepend" />

        <p v-if="compProps.text">{{ $t(compProps.text) }}</p>

        <v-row>
          <v-col
            v-for="(config, index) in visibleFields"
            :key="`form-field-${config.key}`"
            cols="12"
            :md="6 * config.width"
          >
            <!-- @vue-ignore -->
            <v-text-field
              v-model="formModel[config.key]"
              :list="(config.inputDatalist && config.inputDatalist.length > 0) ? config.key : undefined"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :type="config.inputType || 'text'"
              :required="config.required"
              :autofocus="config.autofocus"
              v-if="config.type === 'text'"
            />
            <!-- @vue-ignore -->
            <v-number-input
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :required="config.required"
              :autofocus="config.autofocus"
              v-else-if="config.type === 'number'"
            />
            <!-- @vue-ignore -->
            <v-text-field
              v-model="formModel[config.key]"
              :append-inner-icon="dataVisibilityFlag[index] ? mdiEyeOff : mdiEye"
              :type="dataVisibilityFlag[index] ? 'text' : 'password'"
              :label="$t(config.title)"
              :hide-details="config.hint === undefined"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :autofocus="config.autofocus"
              :disabled="config.disabled === true"
              :required="config.required"
              :prepend-inner-icon="mdiLockOutline"
              @click:append-inner="dataVisibilityFlag[index] = !dataVisibilityFlag[index]"
              v-else-if="config.type === 'password'"
            />
            <datalist :id="config.key" v-if="config.type === 'text' && config.inputDatalist && config.inputDatalist.length > 0">
              <option v-for="option in config.inputDatalist" :key="`item-${option}`">{{ option }}</option>
            </datalist>
            <!-- @vue-ignore -->
            <v-select
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :hide-details="config.hint === undefined"
              :items="config.selectOptions"
              :disabled="config.disabled === true"
              :required="config.required"
              :autofocus="config.autofocus"
              v-else-if="config.type === 'select'"
            />
            <!-- @vue-ignore -->
            <v-autocomplete
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :hide-details="config.hint === undefined"
              :items="config.selectOptions"
              :disabled="config.disabled === true"
              :required="config.required"
              :autofocus="config.autofocus"
              v-else-if="config.type === 'autocomplete'"
            />
            <!-- @vue-ignore -->
            <v-textarea
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :hint="config.hint ? $t(config.hint) : undefined"
              :hide-details="config.hint === undefined"
              :persistent-hint="config.hint !== undefined"
              :required="config.required"
              wrap="off"
              :autofocus="config.autofocus"
              @focus="config.inputAutoSelectAll ? $event.target.select() : undefined"
              v-else-if="config.type === 'textarea'"
            />
            <!-- @vue-ignore -->
            <v-date-input
              v-else-if="config.type === 'date'"
              :hide-details="config.hint === undefined"
              :label="$t(config.title)"
              :display-format="(d: any) => d ? d.toLocaleDateString() : ''"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :clearable="!config.required"
              prepend-icon=""
              :autofocus="config.autofocus"
              prepend-inner-icon="$calendar"
              :model-value="formModel[config.key] ? date.toJsDate(formModel[config.key]) : undefined"
              @update:model-value="v => { formModel[config.key] = date.toISO(v) }"
            />
            <!-- @vue-ignore -->
            <v-date-input
              v-else-if="config.type === 'dateobject'"
              :hide-details="config.hint === undefined"
              :label="$t(config.title)"
              :display-format="(d: any) => d ? d.toLocaleDateString() : ''"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              :clearable="!config.required"
              prepend-icon=""
              :autofocus="config.autofocus"
              prepend-inner-icon="$calendar"
              v-model="formModel[config.key]"
            />
            <!-- @vue-ignore -->
            <v-file-input
              v-else-if="config.type === 'file'"
              :label="$t(config.title)"
              v-model="formModel[config.key]"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
              prepend-icon=""
              :autofocus="config.autofocus"
              :prepend-inner-icon="mdiPaperclip"
              :accept="config.accepts"
            />
            <!-- @vue-ignore -->
            <v-checkbox
              v-else-if="config.type === 'boolean'"
              v-model="formModel[config.key]"
              :label="$t(config.title)"
              :autofocus="config.autofocus"
              :disabled="config.disabled === true"
              :hint="config.hint ? $t(config.hint) : undefined"
              :persistent-hint="config.hint !== undefined"
            />
          </v-col>
        </v-row>

        <slot name="additional-fields" v-bind="{ item: formModel }" />

        <p v-if="error" class="mt-5 text-error">{{ error }}</p>
      </template>

      <v-card-actions>
        <v-spacer />
        <v-btn :text="$t('buttonCancel')" variant="plain" @click="dialog = false" />
        <v-btn :text="$t(compProps.okTitle)" color="primary" variant="tonal" :disabled="!valid" @click="save" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts" generic="T">
  import { mdiEye, mdiEyeOff, mdiLockOutline, mdiPaperclip } from '@mdi/js'
  import { useDate } from 'vuetify'

  export interface SelectOption {
    title: string
    value: number | string
  }

  export interface FieldConfig<T> {
    key: string
    title: string
    hint?: string
    type: 'text' | 'textarea' | 'password' | 'number' | 'date' | 'dateobject' | 'boolean' | 'file' | 'select' | 'autocomplete'
    valid?: (args: any) => boolean
    selectOptions?: SelectOption[]
    disabled?: boolean
    width: number
    required: boolean
    inputType?: string
    inputDatalist?: string[]
    inputAutoSelectAll?: boolean
    accepts?: string
    visible?: (item: T) => boolean
    autofocus?: boolean
  }

  export interface ModalProps<T> {
    title: string
    text?: string
    fields: FieldConfig<T>[]
    notify: () => Promise<boolean>
    okTitle?: string
    maxWidth?: number
  }

  const compProps = withDefaults(defineProps<ModalProps<T>>(), {
    okTitle: 'buttonSave',
    maxWidth: 1024,
  })

  const date = useDate()
  const dialog = ref(false)
  const error = ref<string>()
  // @ts-ignore
  // const formModel = ref<T>({})
  const formModel = defineModel<T>({})
  const emit = defineEmits(['items-changed'])

  const dataVisibilityFlag = ref<boolean[]>([])

  const visibleFields = computed(() => {
    const fm = formModel.value
    if (compProps.fields && fm) {
      return compProps.fields.filter(f => !f.visible || (f.visible(fm) === true))
    } else {
      return []
    }
  })

  watch(visibleFields, async newValue => {
    dataVisibilityFlag.value = newValue ? newValue.map(() => false) : []
  })

  const valid = computed(() => {
    const fm = formModel.value
    // @ts-ignore
    return fm && !compProps.fields.some(f => (f.valid && !f.valid(fm[f.key])) || (f.required && !fm[f.key]))
  })

  function show () {
    dialog.value = true
  }
  function hide () {
    error.value = undefined
    dialog.value = false
  }
  function save () {
    if (!valid.value || !formModel.value) {
      return
    }

    error.value = undefined

    compProps.notify()
      .then((result: boolean) => {
        if (result === true) {
          emit('items-changed')
          hide()
        }
      })
      .catch(e => {
        error.value = e
      })
  }

  defineExpose({
    show,
    hide,
  })
</script>

<style scoped>
</style>

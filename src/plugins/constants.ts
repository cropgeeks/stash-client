import { mdiAccount, mdiAccountArrowRight, mdiAccountLock, mdiShieldAccount } from "@mdi/js"

const stashVersion = '2.0.0'

export interface UserTypeConfig {
  key: string
  color: string
  text: string
  icon: string
}

const userTypeConfig: { [index: string]: UserTypeConfig } = {
  admin: {
    key: 'admin',
    text: 'typesUserAdmin',
    icon: mdiShieldAccount,
    color: 'success',
  },
  regular: {
    key: 'regular',
    text: 'typesUserRegular',
    icon: mdiAccount,
    color: 'info',
  },
  reference: {
    key: 'reference',
    text: 'typesUserReference',
    icon: mdiAccountArrowRight,
    color: 'warning',
  },
  inactive: {
    key: 'inactive',
    text: 'typesUserInactive',
    icon: mdiAccountLock,
    color: 'error',
  },
}

export {
  stashVersion,
  userTypeConfig,
}

import type { ViewTableContainers } from '@/plugins/types/stash'
import { coreStore } from '@/stores/app'

let descriptionAttributeId: number | undefined

function getDescriptionAttributeId () {
  const store = coreStore()

  if (store.containerAttributes) {
    descriptionAttributeId = store.containerAttributes.find(ca => ca.name === 'Description')?.id
  } else {
    descriptionAttributeId = undefined
  }
}

function getContainerDescription (container: ViewTableContainers) {
  if (!descriptionAttributeId) {
    getDescriptionAttributeId()
  }

  if (descriptionAttributeId && container && container.containerAttributes && container.containerAttributes.length > 0 && container.containerAttributes[0] && container.containerAttributes[0].attributeValues) {
    return container.containerAttributes[0].attributeValues[descriptionAttributeId]
  } else {
    return undefined
  }
}

export {
  getContainerDescription,
}

import type { BrowserActionDefinition } from '../../../lib/browser-destinations'
import type { Settings } from '../generated-types'
import { Adobe } from '../types'
import type { Payload } from './generated-types'

const action: BrowserActionDefinition<Settings, Adobe, Payload> = {
  title: 'Upsert Profile',
  description: 'Create or update a user profile in Adobe Target.',
  platform: 'web',
  defaultSubscription: 'type = "identify"',
  fields: {
    profile: {
      type: 'object',
      description: 'Hash of properties for this profile.',
      label: 'Profile Properties',
      default: {
        '@path': '$.profile'
      }
    }
  },
  perform: () => {
    return
  }
}

export default action

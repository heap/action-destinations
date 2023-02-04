import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import { IntegrationError } from '@segment/actions-core'
import { flat } from '../flat'

type AddUserPropertiesPayload = {
  app_id: string
  identify?: string
  properties: {
    anonymous_id?: string
    email?: string
    [k: string]: unknown
  }
}

const action: ActionDefinition<Settings, Payload> = {
  title: 'Identify User',
  description:
    'Set the user properties for a particular device ID or user. More information here: https://developers.heap.io/reference/add-user-properties',
  defaultSubscription: 'type = "identify"',
  fields: {
    identity: {
      label: 'User ID',
      type: 'string',
      allowNull: true,
      description:
        'A unique user identifier. The value that the heap identify call will use to identify the user. Defaults to userId.',
      default: {
        '@path': '$.userId'
      }
    },
    anonymous_id: {
      label: 'Anonymous ID',
      type: 'string',
      allowNull: true,
      description: 'The Segment anonymous ID corresponding to this user.',
      default: {
        '@path': '$.anonymousId'
      }
    },
    traits: {
      label: 'User Properties',
      type: 'object',
      description:
        'An object with key-value properties you want associated with the user. Each key and property must either be a number or string with fewer than 1024 characters.',
      default: {
        '@path': '$.traits'
      }
    }
  },
  perform: async (request, { payload, settings }) => {
    if (!settings.appId) {
      throw new IntegrationError('Missing Heap app ID.', 'Missing required field', 400)
    }

    const userPropertiesPayload: AddUserPropertiesPayload = {
      app_id: settings.appId,
      properties: {}
    }

    if (payload.anonymous_id) {
      userPropertiesPayload.properties.anonymous_id = payload.anonymous_id
    }

    if (payload.identity) {
      userPropertiesPayload.identify = payload.identity
    }

    if (payload.traits && Object.keys(payload.traits).length > 0) {
      const flatten = flat(payload.traits)
      userPropertiesPayload.properties = {
        ...flatten,
        ...userPropertiesPayload.properties
      }
    }

    return request('https://heapanalytics.com/api/add_user_properties', {
      method: 'post',
      json: userPropertiesPayload
    })
  }
}

export default action

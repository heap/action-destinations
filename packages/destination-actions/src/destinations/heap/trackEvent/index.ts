import type { ActionDefinition } from '@segment/actions-core'
import type { Settings } from '../generated-types'
import type { Payload } from './generated-types'
import dayjs from '../../../lib/dayjs'
import { HEAP_SEGMENT_CLOUD_LIBRARY_NAME } from '../constants'
import { getHeapUserId } from '../userIdHash'
import { flat } from '../flat'
import { IntegrationError } from '@segment/actions-core'

type HeapEvent = {
  app_id: string
  identity?: string
  user_id?: number
  event: string | undefined
  properties: {
    [k: string]: unknown
  }
  idempotency_key: string
  timestamp?: string
  session_id?: string
}

const action: ActionDefinition<Settings, Payload> = {
  title: 'Track Event',
  description: 'Send an event to Heap.',
  defaultSubscription: 'type = "track" or type = "page" or type = "screen"',
  fields: {
    message_id: {
      label: 'Message ID',
      type: 'string',
      description: 'Unique event ID generated by Segment.',
      required: true,
      default: {
        '@path': '$.messageId'
      }
    },
    identity: {
      label: 'Identity',
      type: 'string',
      allowNull: true,
      description:
        'An identity, typically corresponding to an existing user. If no such identity exists, then a new user will be created with that identity. Case-sensitive string, limited to 255 characters.',
      default: {
        '@path': '$.userId'
      }
    },
    anonymous_id: {
      label: 'Anonymous ID',
      type: 'string',
      allowNull: true,
      description: 'The generated anonymous ID for the user.',
      default: {
        '@path': '$.anonymousId'
      }
    },
    event: {
      label: 'Track Event Type',
      type: 'string',
      description: 'Name of the user action. This only exists on track events. Limited to 1024 characters.',
      default: {
        '@path': '$.event'
      }
    },
    properties: {
      label: 'Event Properties',
      type: 'object',
      description:
        'An object with key-value properties you want associated with the event. Each key and property must either be a number or string with fewer than 1024 characters.',
      default: {
        '@path': '$.properties'
      }
    },
    timestamp: {
      label: 'Timestamp',
      type: 'datetime',
      description: 'Defaults to the current time if not provided.',
      default: {
        '@path': '$.timestamp'
      }
    },
    session_id: {
      label: 'Session ID',
      type: 'string',
      description:
        'A Heap session ID. The session ID can be retrived by calling getSessionId() on the heap api. If a session ID is not provided one will be created.',
      default: {
        '@path': '$.session_id'
      }
    },
    type: {
      label: 'Type',
      type: 'string',
      description: 'The type of call. Can be track, page, or screen.',
      default: {
        '@path': '$.type'
      }
    },
    name: {
      label: 'Page or Screen Name',
      type: 'string',
      description: 'The name of the page or screen being viewed. This only exists for page and screen events.',
      default: {
        '@path': '$.name'
      }
    }
  },
  perform: (request, { payload, settings }) => {
    if (!settings.appId) {
      throw new IntegrationError('Missing app ID')
    }

    if (!payload.anonymous_id && !payload.identity) {
      throw new IntegrationError('Either anonymous user id or identity should be specified.')
    }

    const defaultEventProperties = { segment_library: HEAP_SEGMENT_CLOUD_LIBRARY_NAME }
    const flatten = flat(payload.properties || {})
    const eventProperties = Object.assign(defaultEventProperties, flatten)

    const heapPayload: HeapEvent = {
      app_id: settings.appId,
      event: payload.type ? payload.type : 'track',
      properties: eventProperties,
      idempotency_key: payload.message_id
    }

    if (payload.anonymous_id && !payload.identity) {
      heapPayload.user_id = getHeapUserId(payload.anonymous_id)
    }

    if (payload.identity) {
      heapPayload.identity = payload.identity
    }

    if (payload.timestamp && dayjs.utc(payload.timestamp).isValid()) {
      heapPayload.timestamp = dayjs.utc(payload.timestamp).toISOString()
    }

    if (payload.session_id) {
      heapPayload.session_id = payload.session_id
    }

    return request('https://heapanalytics.com/api/track', {
      method: 'post',
      json: heapPayload
    })
  }
}

export default action

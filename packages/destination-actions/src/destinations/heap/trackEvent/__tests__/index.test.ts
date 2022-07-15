import nock from 'nock'
import { createTestEvent, createTestIntegration, JSONValue, SegmentEvent } from '@segment/actions-core'
import Destination from '../../index'
import { embededObject } from '../../util'

describe('Heap.trackEvent', () => {
  const testDestination = createTestIntegration(Destination)
  const timestamp = '2021-08-17T15:21:15.449Z'
  const HEAP_TEST_APP_ID = '11'
  const userId = 'foo@example.org'
  const messageId = '123'
  const eventName = 'Test Event'
  let body: {
    app_id: string
    event: string
    idempotency_key: string
    properties: {
      [k: string]: string | null | boolean | number
    }
    timestamp: string
    identity?: string
    use_user_id?: boolean
    user_id?: number
  }
  beforeEach(() => {
    body = {
      app_id: HEAP_TEST_APP_ID,
      event: eventName,
      idempotency_key: messageId,
      properties: {
        segment_library: 'analytics.js'
      },
      timestamp
    }
  })

  afterEach((done) => {
    const allNockIsCalled = nock.isDone()
    nock.cleanAll()
    if (allNockIsCalled) {
      done()
    } else {
      done.fail(new Error('Not all nock interceptors were used!'))
    }
  })

  it('should validate action fields for identified users', async () => {
    const event: Partial<SegmentEvent> = createTestEvent({
      timestamp,
      event: eventName,
      userId,
      messageId
    })
    body.identity = userId
    nock('https://heapanalytics.com').post('/api/track', body).reply(200, {})

    const responses = await testDestination.testAction('trackEvent', {
      event,
      useDefaultMappings: true,
      settings: {
        appId: HEAP_TEST_APP_ID
      }
    })
    expect(responses.length).toBe(1)
    expect(responses[0].status).toBe(200)
    expect(responses[0].data).toMatchObject({})
  })

  it('should validate action fields for anonymous users', async () => {
    const testTimestampValue = '2021-08-17T15:21:15.449Z'
    const event = createTestEvent({
      timestamp: testTimestampValue,
      event: 'Test Event',
      anonymousId: '5a41f0df-b69a-4a99-b656-79506a86c3f8',
      userId: null,
      messageId: '123'
    })

    body.use_user_id = true
    body.user_id = 8325872782136936

    nock('https://heapanalytics.com').post('/api/track', body).reply(200, {})

    const responses = await testDestination.testAction('trackEvent', {
      event,
      useDefaultMappings: true,
      settings: {
        appId: HEAP_TEST_APP_ID
      }
    })
    expect(responses.length).toBe(1)
    expect(responses[0].status).toBe(200)
    expect(responses[0].data).toMatchObject({})
  })

  it('should validate action fields for a complex user', async () => {
    const testTimestampValue = '2021-08-17T15:21:15.449Z'
    const properties = embededObject as unknown as {
      [k: string]: JSONValue
    }
    const event = createTestEvent({
      timestamp: testTimestampValue,
      event: 'Test Event',
      anonymousId: '5a41f0df-b69a-4a99-b656-79506a86c3f8',
      userId: null,
      messageId: '123',
      properties
    })

    body.use_user_id = true
    body.user_id = 8325872782136936
    body.properties = {
      segment_library: 'analytics.js',
      firstName: 'John',
      middleName: '',
      lastName: 'Green',
      'car.make': 'Honda',
      'car.model': 'Civic',
      'car.revisions.0.miles': 10150,
      'car.revisions.0.code': 'REV01',
      'car.revisions.0.changes': 0,
      'car.revisions.1.miles': 20021,
      'car.revisions.1.code': 'REV02',
      'car.revisions.1.changes.0.type': 'asthetic',
      'car.revisions.1.changes.0.desc': 'Left tire cap',
      'car.revisions.1.changes.0.price': 123.45,
      'car.revisions.1.changes.1.type': 'mechanic',
      'car.revisions.1.changes.1.desc': 'Engine pressure regulator',
      'car.revisions.1.changes.1.engineer': null,
      'visits.0.date': '2015-01-01',
      'visits.0.dealer': 'DEAL-001',
      'visits.1.date': '2015-03-01',
      'visits.1.dealer': 'DEAL-002'
    }
    nock('https://heapanalytics.com').post('/api/track', body).reply(200, {})

    const responses = await testDestination.testAction('trackEvent', {
      event,
      useDefaultMappings: true,
      settings: {
        appId: HEAP_TEST_APP_ID
      }
    })

    expect(responses.length).toBe(1)
    expect(responses[0].status).toBe(200)
    expect(responses[0].data).toMatchObject({})
  })
})

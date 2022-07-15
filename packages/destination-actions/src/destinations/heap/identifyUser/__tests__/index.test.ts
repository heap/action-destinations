import nock from 'nock'
import { createTestEvent, createTestIntegration, JSONValue } from '@segment/actions-core'
import Destination from '../../index'
import { getHeapUserId } from '../../userIdHash'
import { SegmentEvent } from '@segment/actions-core'
import { embededObject } from '../../util'

describe('Heap.identifyUser', () => {
  describe('accepts', () => {
    const testDestination = createTestIntegration(Destination)
    const timestamp = '2021-08-17T15:21:15.449Z'
    const HEAP_TEST_APP_ID = '11'
    const userId = 'identity1'
    const anonymousId = 'anon1'
    const event: Partial<SegmentEvent> = createTestEvent({ timestamp, userId, anonymousId })
    const heapUserId = getHeapUserId(anonymousId)
    const aupBody = {
      app_id: HEAP_TEST_APP_ID,
      identity: userId,
      properties: {}
    }
    beforeEach(() => {
      expect(heapUserId).toBe(435837195053672)
      const identifyBody = {
        app_id: HEAP_TEST_APP_ID,
        identity: userId,
        user_id: heapUserId
      }
      nock('https://heapanalytics.com').post('/api/v1/identify', identifyBody).reply(200, {})
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

    async function validateEvent() {
      const responses = await testDestination.testAction('identifyUser', {
        event,
        useDefaultMappings: true,
        settings: {
          appId: HEAP_TEST_APP_ID
        }
      })
      expect(responses.length).toBe(2)

      expect(responses[0].status).toBe(200)
      expect(responses[0].data).toMatchObject({})
      expect(responses[1].status).toBe(200)
      expect(responses[1].data).toMatchObject({})
    }

    it('a Record<string, string | number | boolean | null >', async () => {
      const traits = { myString: '123', myNumber: 123, myBool: true, myNull: null }
      event.traits = traits
      const flatten = traits
      aupBody.properties = flatten

      nock('https://heapanalytics.com').post('/api/add_user_properties', aupBody).reply(200, {})

      await validateEvent()
    })

    it('an embeded object', async () => {
      event.traits = embededObject as unknown as {
        [k: string]: JSONValue
      }
      aupBody.properties = {
        'car.make': 'Honda',
        'car.model': 'Civic',
        'car.revisions.0.changes': 0,
        'car.revisions.0.code': 'REV01',
        'car.revisions.0.miles': 10150,
        'car.revisions.1.changes.0.desc': 'Left tire cap',
        'car.revisions.1.changes.0.price': 123.45,
        'car.revisions.1.changes.0.type': 'asthetic',
        'car.revisions.1.changes.1.desc': 'Engine pressure regulator',
        'car.revisions.1.changes.1.engineer': null,
        'car.revisions.1.changes.1.type': 'mechanic',
        'car.revisions.1.code': 'REV02',
        'car.revisions.1.miles': 20021,
        firstName: 'John',
        lastName: 'Green',
        middleName: '',
        'visits.0.date': '2015-01-01',
        'visits.0.dealer': 'DEAL-001',
        'visits.1.date': '2015-03-01',
        'visits.1.dealer': 'DEAL-002'
      }

      nock('https://heapanalytics.com').post('/api/add_user_properties', aupBody).reply(200, {})

      await validateEvent()
    })
  })
})

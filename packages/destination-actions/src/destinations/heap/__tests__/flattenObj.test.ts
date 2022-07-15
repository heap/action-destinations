import { flattenObj, Properties } from '../flattenObj'
import { embededObject } from '../util'

describe('flattenObj for ', () => {
  describe('a flat kvp where the value is a ', () => {
    it('undefined', () => {
      expect(flattenObj({ myUndefined: undefined } as Properties)).toEqual({})
    })

    it('null', () => {
      expect(flattenObj({ myNull: null })).toEqual({ myNull: null })
    })

    it('number', () => {
      expect(flattenObj({ myNumber: 1 })).toEqual({ myNumber: 1 })
    })

    it('string', () => {
      expect(flattenObj({ myString: '1' })).toEqual({ myString: '1' })
    })

    it('boolean', () => {
      expect(flattenObj({ myBool: true })).toEqual({ myBool: true })
    })
  })

  describe('array of ', () => {
    it('nulls:', () => {
      expect(flattenObj({ myNulls: [null, 1, null, 3] })).toEqual({
        'myNulls.0': null,
        'myNulls.1': 1,
        'myNulls.2': null,
        'myNulls.3': 3
      })
    })

    it('numbers:', () => {
      expect(flattenObj({ myNumbers: [1, 2, 3, 4] })).toEqual({
        'myNumbers.0': 1,
        'myNumbers.1': 2,
        'myNumbers.2': 3,
        'myNumbers.3': 4
      })
    })

    it('strings:', () => {
      expect(flattenObj({ myStrings: ['a', '1', 'b', '2'] })).toEqual({
        'myStrings.0': 'a',
        'myStrings.1': '1',
        'myStrings.2': 'b',
        'myStrings.3': '2'
      })
    })

    it('booleans:', () => {
      expect(flattenObj({ myBools: [true, false, true, false] })).toEqual({
        'myBools.0': true,
        'myBools.1': false,
        'myBools.2': true,
        'myBools.3': false
      })
    })
  })

  it('Embedded object', () => {
    expect(flattenObj(embededObject)).toEqual({
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
    })
  })

  it('primitive', () => {
    expect(flattenObj(null as unknown as Properties)).toEqual({})
    expect(flattenObj([] as unknown as Properties)).toEqual({})
    expect(flattenObj(1 as unknown as Properties)).toEqual({})
    expect(flattenObj('string' as unknown as Properties)).toEqual({
      '0': 's',
      '1': 't',
      '2': 'r',
      '3': 'i',
      '4': 'n',
      '5': 'g'
    })
    expect(flattenObj(true as unknown as Properties)).toEqual({})
  })
})

require('../src/index');

import {matchesConditions, where, expandQuery, compressQuery, serializeQuery, deserializeQuery} from '../src/index';

describe('Serialization', function() {
  let subject, conditions, result;

  describe("matchesConditions", function(){
    beforeEach(function(){
      subject = {
        name: 'tupac',
        traits: ['poet', 'warrior'],
        targets: [ {type: 'character', attack: 1}, {type: 'character', attack: 2} ],
        zone: 'units',
        attack: 10
      }
    });

    it('matches', function(){
      conditions = [
        {any: {name: {includes: ['tu', 'something']}}}
      ]

      expect(matchesConditions(subject, conditions)).toEqual(true);
      expect(matchesConditions(subject, compressQuery(expandQuery(conditions)))).toEqual(true);
      conditions = expandQuery([{ any: { zone: ['units', 'structures'] }}]);
      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([{all: {zone: 'units', traits: 'poet'}}])
      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {zone: 'units', traits: 'poet'}},
        {any: {name: 'tupac'}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {zone: 'units', traits: 'poet'}},
        {any: {name: 'biggie'}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(false);

      conditions = expandQuery([
        {all: {zone: 'units', traits: 'poet'}},
        {any: {name: ['biggie', 'tupac']}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {zone: 'notunits', traits: 'poet'}},
        {any: {name: ['biggie', 'tupac']}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(false);

      conditions = expandQuery({
          any: [
            {all: {zone: 'notunits', traits: 'poet'}},
            {any: {name: ['biggie', 'tupac']}}
          ]
      })

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([{
          any: [
            {all: {zone: 'notunits', traits: 'poet'}},
            {any: {name: ['biggie', 'tupac']}}
          ]
      }])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {any: {zone: 'notunits', traits: 'poet'}},
        {any: {name: ['biggie', 'tupac']}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {traits: 'poet'}},
        {all: {traits: 'warrior'}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {traits: ['poet', 'warrior']}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {traits: ['poet']}},
        {all: {name: 'tupac', zone: 'units'}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = expandQuery([
        {all: {traits: ['poet']}},
        {all: {name: 'tupac', zone: 'junkyard'}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(false);

      conditions = expandQuery([
        {none: {traits: ['poet']}},
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(false);

      conditions = [
        {none: {traits: ['blah']}},
      ]

      expect(matchesConditions(subject, conditions)).toEqual(true);

      conditions = expandQuery([
        {all: {attack: 10}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = [
        {all: {attack: {gt: 5}}}
      ]

      expect(matchesConditions(subject, conditions)).toEqual(true);

      conditions = [
        {all: {attack: {gt: 15}}}
      ]

      expect(matchesConditions(subject, conditions)).toEqual(false);

      conditions = expandQuery([
        {all: {name: {includes: 'pac'}}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(true);

      conditions = [
        {all: {name: {includes: ['tu', 'pac']}}}
      ]

      expect(matchesConditions(subject, conditions)).toEqual(true);



      conditions = expandQuery([
        {all: {name: {includes: ['tu', 'pac']}}},
        {all: {name: {doesNotInclude: ['tup']}}}
      ])

      expect(matchesConditions(subject, compressQuery(conditions))).toEqual(false);

      conditions = [
        {all: {name: {startsWith: ['tu']}}}
      ]

      expect(matchesConditions(subject, conditions)).toEqual(true);

      conditions = [
        {all: {name: {endsWith: ['pac']}}}
      ]

      expect(matchesConditions(subject, conditions)).toEqual(true);
    })

  })

  describe("where", function(){
    beforeEach(function(){
      subject = [
        {
          name: 'tupac',
          traits: ['poet', 'warrior'],
          targets: [ {type: 'character', attack: 1}, {type: 'character', attack: 2} ],
          zone: 'west',
          attack: 10
        },
        {
          name: 'biggie',
          traits: ['poet', 'dealer'],
          zone: 'east',
          attack: 5
        }
      ]
    });

    it("searches array", function() {
      conditions = serializeQuery([{all: {name: 'tupac'}}])
      expect(where(subject, deserializeQuery(conditions))[0].name === 'tupac').toEqual(true);
      expect(where(subject, deserializeQuery(conditions)).length).toEqual(1);

      conditions = [{all: {traits: 'dealer'}}]
      expect(where(subject, conditions)[0].name === 'biggie').toEqual(true);
      expect(where(subject, conditions).length).toEqual(1);

      conditions = [{all: {traits: 'poet'}}]
      expect(where(subject, conditions).length).toEqual(2);
    });

    it("stringDirectives", function() {
      conditions = [{all: {name: {includes: 'z'}}}]
      expect(where(subject, conditions).length).toEqual(0);

      conditions = [{all: {zone: {includes: 'e'},}}]
      expect(where(subject, conditions).length).toEqual(2);

      conditions = [{all: {zone: {includes: 'e'}}}]
      expect(where(subject, conditions).length).toEqual(2);
    })

    it("numeric", function() {
      conditions = [{all: {attack: {gt: 5}}}]
      expect(where(subject, conditions)[0].name).toEqual('tupac');
      expect(where(subject, conditions).length).toEqual(1);

      conditions = [{all: {attack: {gt: 5}, zone: 'east'}}]
      expect(where(subject, conditions).length).toEqual(0);
    })
  })
});

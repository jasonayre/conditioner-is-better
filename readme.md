### Conditioner Is better

A simple, powerful, and relatively fast, condition matching DSL / Array search.

Examples:

#### matchesConditions
```
import {matchesConditions} from 'conditioner-is-better';

conditions = [{ any: { zone: ['units', 'structures'] }}];
expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [{all: {zone: 'units', traits: 'poet'}}]
expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {zone: 'units', traits: 'poet'}},
  {any: {name: 'tupac'}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {zone: 'units', traits: 'poet'}},
  {any: {name: 'biggie'}}
]

expect(matchesConditions(subject, conditions)).toEqual(false);

conditions = [
  {all: {zone: 'units', traits: 'poet'}},
  {any: {name: ['biggie', 'tupac']}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {zone: 'notunits', traits: 'poet'}},
  {any: {name: ['biggie', 'tupac']}}
]

expect(matchesConditions(subject, conditions)).toEqual(false);

conditions = {
    any: [
      {all: {zone: 'notunits', traits: 'poet'}},
      {any: {name: ['biggie', 'tupac']}}
    ]
}

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {any: {zone: 'notunits', traits: 'poet'}},
  {any: {name: ['biggie', 'tupac']}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {traits: 'poet'}},
  {all: {traits: 'warrior'}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {traits: ['poet', 'warrior']}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {traits: ['poet']}},
  {all: {name: 'tupac', zone: 'units'}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {traits: ['poet']}},
  {all: {name: 'tupac', zone: 'junkyard'}}
]

expect(matchesConditions(subject, conditions)).toEqual(false);

conditions = [
  {none: {traits: ['poet']}},
]

expect(matchesConditions(subject, conditions)).toEqual(false);

conditions = [
  {none: {traits: ['blah']}},
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {attack: 10}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {attack: {gt: 5}}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {attack: {gt: 15}}}
]

expect(matchesConditions(subject, conditions)).toEqual(false);
```

#### where

```
subject = [
  {
    name: 'tupac',
    traits: ['poet', 'warrior'],
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

conditions = [{all: {name: 'tupac'}}]
expect(where(subject, conditions)[0].name === 'tupac').toEqual(true);

conditions = [{all: {traits: 'dealer'}}]
expect(where(subject, conditions)[0].name === 'biggie').toEqual(true);

conditions = [{all: {traits: 'poet'}}]
expect(where(subject, conditions).length).toEqual(2);

conditions = [{all: {attack: {gt: 5}}}]
expect(where(subject, conditions)[0].name).toEqual('tupac');
expect(where(subject, conditions).length).toEqual(1);

conditions = [{all: {attack: {gt: 5}, zone: 'east'}}]
expect(where(subject, conditions).length).toEqual(0);
```

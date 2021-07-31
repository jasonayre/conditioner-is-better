## Conditioner Is Better

A simple, powerful, and relatively fast, condition matching DSL / Array search. Abstracted from the rules engine of [DarkMatterGame](http://www.playdarkmatter.com)

Inspired by https://github.com/deitch/searchjs , ConditionerIsBetter supports most of the basic functionality of that library, and a similar/simpler DSL - But is at least 100-1000x faster (Can't remember exactly, I did the benchmark awhile back while writing this code to replace the use of searchjs validating actions and rules in the game engine ^, as it was a huge performance bottleneck)

Library consists of 2 simple functions, **where** and **matchesConditions**

Both take an array of objects, which specify conditions via one of 3 top level predicates as keys
`{all, any, none}`, i.e. `[{all: {name: 'tupac'}}]` will return true for an object such as `{name: tupac}`

(See the full examples from the specs below for more detailed use cases)

### #matchesConditions

Given the data below
```
import {matchesConditions} from 'conditioner-is-better';

subject = {
  name: 'tupac',
  traits: ['poet', 'warrior'],
  targets: [ {type: 'character', attack: 1}, {type: 'character', attack: 2} ],
  zone: 'units',
  attack: 10
}
```

#### any
```
conditions = [{ any: { zone: ['units', 'structures'] }}];
expect(matchesConditions(subject, conditions)).toEqual(true);
```

#### all
```
conditions = [{all: {zone: 'units', traits: 'poet'}}]
expect(matchesConditions(subject, conditions)).toEqual(true);
```

#### none
```
conditions = [
  {none: {traits: ['poet']}},
]
expect(matchesConditions(subject, conditions)).toEqual(false);
```

#### If the all or any condition fails here, it will return false (implicitly an all condition when there is an array of multiple conditions at the top level)
```
conditions = [
  {all: {zone: 'units', traits: 'poet'}},
  {any: {name: 'tupac'}}
]
expect(matchesConditions(subject, conditions)).toEqual(true);
```

#### Changing the implicit top level all, to an any condition can be accomplished as follows
```
conditions = {
    any: [
      {all: {zone: 'notunits', traits: 'poet'}},
      {any: {name: ['biggie', 'tupac']}}
    ]
}
expect(matchesConditions(subject, conditions)).toEqual(true);
```

#### Numeric Conditions
supports `gt, lt, gte, lte`
```
conditions = [
  {all: {attack: {gt: 5}}}
]
expect(matchesConditions(subject, conditions)).toEqual(true);
```

#### String matching Conditions
supports `includes, doesNotInclude, startsWith, endsWith, doesNotStartWith, doesNotEndWith`
```
conditions = [
  {all: {name: {includes: ['tu', 'pac']}}}
]
expect(matchesConditions(subject, conditions)).toEqual(true);
```

### #where

Where works just like matchesConditions above, just on an array of objects as the input. So given the data below:

```
import {where} from 'conditioner-is-better';

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
```

#### Return objects matching a string property
```
conditions = [{all: {name: 'tupac'}}]
expect(where(subject, conditions)[0].name === 'tupac').toEqual(true);
```

#### Return objects matching a string in an array
```
conditions = [{all: {traits: 'dealer'}}]
expect(where(subject, conditions)[0].name === 'biggie').toEqual(true);
```

#### Return objects matching a numeric constraint
```
conditions = [{all: {attack: {gt: 5}}}]
expect(where(subject, conditions)[0].name).toEqual('tupac');
expect(where(subject, conditions).length).toEqual(1);
```

So on and so forth.

#### matchesConditions spec full examples
```
import {matchesConditions} from 'conditioner-is-better';

subject = {
  name: 'tupac',
  traits: ['poet', 'warrior'],
  targets: [ {type: 'character', attack: 1}, {type: 'character', attack: 2} ],
  zone: 'units',
  attack: 10
}

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

conditions = [
  {all: {name: {includes: 'pac'}}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {name: {includes: ['tu', 'pac']}}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {name: {includes: ['tu', 'pac']}}},
  {all: {name: {doesNotInclude: ['tup']}}}
]

expect(matchesConditions(subject, conditions)).toEqual(false);

conditions = [
  {all: {name: {startsWith: ['tu']}}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);

conditions = [
  {all: {name: {endsWith: ['pac']}}}
]

expect(matchesConditions(subject, conditions)).toEqual(true);
```

#### where full spec examples

```
import {where} from 'conditioner-is-better';

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

conditions = [{all: {name: {includes: 'z'}}}]
expect(where(subject, conditions).length).toEqual(0);

conditions = [{all: {zone: {includes: 'e'}}}]
expect(where(subject, conditions).length).toEqual(2);
```

### Special Directives

As shown above, when comparing numeric values, you can pass an object as the value, i.e.
`{all: {cost: {gt: 2}}}`, which allows you to use the following directives as keys:

`gt, lt, gte, lte`

The same goes for strings, but the directives are:

`includes, doesNotInclude, startsWith, endsWith, doesNotStartWith, doesNotEndWith`

import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import some from 'lodash/some';
import every from 'lodash/every';
import map from 'lodash/map';
import each from 'lodash/each';
import keys from 'lodash/keys';
import values from 'lodash/values';
import get from 'lodash/get';
import gt from 'lodash/gt';
import gte from 'lodash/gte';
import lt from 'lodash/lt';
import lte from 'lodash/lte';
import isObject from 'lodash/isObject';
import first from 'lodash/first';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';
import startsWith from 'lodash/startsWith';
import endsWith from 'lodash/endsWith';
import toPairs from 'lodash/toPairs';

function isEqual(target, source) {
  return target === source;
}

function none(target, source) { return !some(target, source) }

function matchesArray(target, source) {
  if(isArray(source)) {
    return some(source, (i) => { return includes(target, i) })
  } else {
    return includes(target, source);
  }
}

const COMPARISONS = {
  gt, gte, lt, lte
}

function matchesComparison(comparisons, source) {
  return every(comparisons, (v, k) => {
     return COMPARISONS[k](source, v);
  })
}

const KEYS_FOR_COMPARISON = ["gt", "gte", "lt", "lte"];

function isComparison(obj) {
  return includes(KEYS_FOR_COMPARISON, keys(obj)[0]);
}

function doesNotInclude(source, v) { return !includes(source, v) }
function doesNotStartWith(source, v) { return !startsWith(source, v) }
function doesNotEndWith(source, v) { return !endsWith(source, v) }

const STRING_DIRECTIVES = {
  includes,
  doesNotInclude,
  startsWith,
  endsWith,
  doesNotStartWith,
  doesNotEndWith
}

const KEYS_FOR_STRING_DIRECTIVES = ["includes", "doesNotInclude", "startsWith", "endsWith", "doesNotStartWith", "doesNotEndWith"];

function isStringDirective(obj) {
  return includes(KEYS_FOR_STRING_DIRECTIVES, keys(obj)[0]);
}

function matchesStringDirective(string_directives, source) {
  debugger;
  return every(string_directives, (v, k) => {
    if(isArray(v)) {
      STRING_DIRECTIVES;
      some;
      debugger;
      return some(v, (_v) => { return STRING_DIRECTIVES[k](source, _v) });
    } else {
      return STRING_DIRECTIVES[k](source, v);
    }
  })
}

export class InvertedMatcher {
  //to be implemented by subclass
  matches(source) {
    return false;
  }

  get is_inverted_matcher() { return true }
}

const QuantifierFunctions = {
  any: some,
  all: every,
  none
}

const QuantifierKeys = ["any", "all", "none"];

function isMatchingStatement(obj) {
  return includes(QuantifierKeys, keys(obj)[0]);
}

export function passesConditions(object, conditions, quantifier='all') {
  let results = map(conditions, (v,k) => {
    let target = get(object, k);

    if(isArray(v)) {
      return matchesArray(target, v);
    } else if(isString(v) && isArray(target)) {
      return matchesArray(v, target);
    } else if(isString(v)) {
      return isEqual(target, v);
    } else if(isBoolean(v)) {
      return isEqual(target, v);
    } else if(isNumber(v)) {
      return isEqual(target, v);
    } else if(isComparison(v)) {
      return matchesComparison(v, target);
    } else if(isStringDirective(v)) {
      return matchesStringDirective(v, target);
    } else if(isUndefined(v)) {
       return isEqual(target, v);
    } else if(isMatchingStatement(v)) {
      return every(v, (_conditions, _quantifier) => {
        return passesConditions(object, _conditions, _quantifier);
      })
    } else if(isFunction(v)) {
      return v(target);
    } else {
      console.log("got something else", target);
      return false;
    }
  })

  return QuantifierFunctions[quantifier](results);
}

function isInvertedMatcher(conditions) { return get(conditions, 'is_inverted_matcher', false) }

export function matchesConditions(object, conditions, quantifier='all') {
  if(isFunction(conditions)) {
    return conditions(object);
  } else if(isInvertedMatcher(conditions)) {
    return conditions.matches(object);
  }else if(isArray(conditions)) {
    return every(conditions, (condition) => { return matchesConditions(object, condition, quantifier) })
  } else if(isMatchingStatement(conditions)) {
    return every(conditions, (_conditions, _quantifier) => {
      return passesConditions(object, _conditions, _quantifier);
    })
  } else {
    return passesConditions(object, conditions, quantifier);
  }
}

function prepareValueAsObject(value) {
  if(isString(value)) {
    return {'equals': value}
  } else {
    return value
  }
}

function serializeComparisons({quantifier='', value={}}) {
  let comparisons_array = !isArray(value) ? toPairs(value) : map(value, toPairs)
  let comparisons = map(comparisons_array, (pair) => { return {property: pair[0], value: prepareValueAsObject(pair[1])}})
  let result = {comparisons: comparisons, quantifier: quantifier}

  return result;
}

function prepareExpandedValue(value) {
  if(keys(value)[0] === 'equals' || keys(value)[0] === '=') { return values(value)[0]}
  return value
}

function prepareExpandedConditions(conditions) {
  let compressed = []
  each(conditions, (condition) => {
    let result = {}

    result[condition.quantifier] = {}

    each(condition.comparisons, (comparison) => {
      result[condition.quantifier][comparison.property] = prepareExpandedValue(comparison.value)
    })

    compressed.push(result);
  })

  return compressed
}

export function compressQuery(query, result={}) {
  each(query, (subquery) => {
    result[subquery.quantifier] = prepareExpandedConditions(subquery.conditions)
  })

  return result
}

export function expandQuery(obj, isTopLevel=true) {
  if(isArray(obj)) {
    let result =  map(obj, (_obj) => {
      let quantifier = keys(_obj)[0];
      return serializeComparisons({quantifier: quantifier, value: values(_obj)[0]});
    })

    if(isTopLevel) {
      return [{conditions: result, quantifier: 'all'}]
    } else {
      return result
    }
  } else if(isObject(obj)) {
    return map(obj, (v, k) => {
      let _item = {}
      _item['quantifier'] = k
      if(isArray(v)) {
        _item['conditions'] = expandQuery(v, false);
        return _item;
      } else {
        return serializeComparisons({quantifier: k, value: v})
      }
    })
  }
}

export function serializeQuery(obj) {
  return JSON.stringify(expandQuery(obj))
}

export function deserializeQuery(obj) {
  return compressQuery(JSON.parse(obj))
}

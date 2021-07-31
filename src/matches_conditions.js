import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isBoolean from 'lodash/isBoolean';
import some from 'lodash/some';
import every from 'lodash/every';
import map from 'lodash/map';
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

// import {includes, isArray, isString, isNumber, isBoolean, some, every, map, keys, values,
//   get, gt, gte, lt, lte, isObject, first, isFunction, isUndefined} from 'lodash';

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

export class InvertedMatcher {
  //to be implemented by subclass
  matches(source) {
    return false;
  }

  get is_inverted_matcher() { return true }
}

const ConjunctionFunctions = {
  any: some,
  all: every,
  none
}

const ConjunctionKeys = ["any", "all", "none"];

function isMatchingStatement(obj) {
  return includes(ConjunctionKeys, keys(obj)[0]);
}

export function passesConditions(object, conditions, conjunction='all') {
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
    } else if(isUndefined(v)) {
       return isEqual(target, v);
    } else if(isMatchingStatement(v)) {
      return every(v, (_conditions, _conjunction) => {
        return passesConditions(object, _conditions, _conjunction);
      })
    } else if(isFunction(v)) {
      return v(target);
    } else {
      console.log("got something else", target);
      return false;
    }
  })

  return ConjunctionFunctions[conjunction](results);
}

function isInvertedMatcher(conditions) { return get(conditions, 'is_inverted_matcher', false) }

export function matchesConditions(object, conditions, conjunction='all') {
  if(isFunction(conditions)) {
    return conditions(object);
  } else if(isInvertedMatcher(conditions)) {
    return conditions.matches(object);
  }else if(isArray(conditions)) {
    return every(conditions, (condition) => { return matchesConditions(object, condition, conjunction) })
  } else if(isMatchingStatement(conditions)) {
    return every(conditions, (_conditions, _conjunction) => {
      return passesConditions(object, _conditions, _conjunction);
    })
  } else {
    return passesConditions(object, conditions, conjunction);
  }
}

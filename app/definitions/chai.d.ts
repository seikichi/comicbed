
declare module chai {
  function assert(obj: any, message?: string): void;
  module assert {
    function fail(actual: any, expected: any, message?: string, operator?: any): void;
    function ok(object: any, message?: string): void;
    function notOk(object: any, message?: string): void;
    function equal(actual: any, expected: any, message?: string): void;
    function notEqual(actual: any, expected: any, message?: string): void;
    function strictEqual(actual: any, expected: any, message?: string): void;
    function notStrictEqual(actual: any, expected: any, message?: string): void;
    function deepEqual(actual: any, expected: any, message?: string): void;
    function notDeepEqual(actual: any, expected: any, message?: string): void;

    function isTrue(value: any, message?: string): void;
    function isFalse(value: any, message?: string): void;

    function isNull(value: any, message?: string): void;
    function isNotNull(value: any, message?: string): void;

    function isUndefined(value: any, message?: string): void;
    function isDefined(value: any, message?: string): void;

    function isFunction(value: any, message?: string): void;
    function isNotFunction(value: any, message?: string): void;

    function isObject(value: any, message?: string): void;
    function isNotObject(value: any, message?: string): void;

    function isArray(value: any, message?: string): void;
    function isNotArray(value: any, message?: string): void;

    function isString(value: any, message?: string): void;
    function isNotString(value: any, message?: string): void;

    function isNumber(value: any, message?: string): void;
    function isNotNumber(value: any, message?: string): void;

    function isBoolean(value: any, message?: string): void;
    function isNotBoolean(value: any, message?: string): void;

    function typeOf(value: any, name: string, message?: string): void;
    function notTypeOf(value: any, name: string, message?: string): void;

    function instanceOf(object: any, ctor: any, message?: string): void;
    function notInstanceOf(object: any, ctor: any, message?: string): void;

    function include(haystack: any, needle: any, message?: string): void;
    function notInclude(haystack: any, needle: any, message?: string): void;

    function match(value: any, regexp: any, message?: string): void;
    function notMatch(value: any, regexp: any, message?: string): void;

    function property(object: any, property: string, message?: string): void;
    function notProperty(object: any, property: string, message?: string): void;

    function deepProperty(object: any, property: string, message?: string): void;
    function notDeepProperty(object: any, property: string, message?: string): void;

    function propertyVal(object: any, property: string, value: any, message?: string): void;
    function propertyNotVal(object: any, property: string, value: any, message?: string): void;

    function deepPropertyVal(object: any, property: string, value: any, message?: string): void;
    function deepPropertyNotVal(object: any, property: string, value: any, message?: string): void;

    function lengthOf(object: any, length: number, message?: string): void;

    function throws(func: any, message?: string): void;
    function throws(func: any, ctor: any, message?: string): void;
    function doesNotThrows(func: any, message?: string): void;
    function doesNotThrows(func: any, ctor: any, message?: string): void;

    function operator(val1: any, operator: string, val2: any, message?: string): void;
    function closeTo(actual: number, expected: number, delta: number, message?: string): void;
    function sameMembers(set1: any[], set2: any[], message?: string): void
    function includeMembers(set1: any[], set2: any[], message?: string): void
  }
}


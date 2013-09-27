// Note: For maximum-speed code, see "Optimizing Code" on the Emscripten wiki, https://github.com/kripken/emscripten/wiki/Optimizing-Code
// Note: Some Emscripten settings may limit the speed of the generated code.
// The Module object: Our interface to the outside world. We import
// and export values on it, and do the work to get that through
// closure compiler if necessary. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to do an eval in order to handle the closure compiler
// case, where this code here is minified but Module was defined
// elsewhere (e.g. case 4 above). We also need to check if Module
// already exists (e.g. case 3 above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module;
if (!Module) Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');
// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
for (var key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}
// The environment setup code below is customized to use Module.
// *** Environment setup code ***
var ENVIRONMENT_IS_NODE = typeof process === 'object' && typeof require === 'function';
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
if (ENVIRONMENT_IS_NODE) {
  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  Module['print'] = function(x) {
    process['stdout'].write(x + '\n');
  };
  Module['printErr'] = function(x) {
    process['stderr'].write(x + '\n');
  };
  var nodeFS = require('fs');
  var nodePath = require('path');
  Module['read'] = function(filename, binary) {
    filename = nodePath['normalize'](filename);
    var ret = nodeFS['readFileSync'](filename);
    // The path is absolute if the normalized version is the same as the resolved.
    if (!ret && filename != nodePath['resolve'](filename)) {
      filename = path.join(__dirname, '..', 'src', filename);
      ret = nodeFS['readFileSync'](filename);
    }
    if (ret && !binary) ret = ret.toString();
    return ret;
  };
  Module['readBinary'] = function(filename) { return Module['read'](filename, true) };
  Module['load'] = function(f) {
    globalEval(read(f));
  };
  Module['arguments'] = process['argv'].slice(2);
  module.exports = Module;
}
if (ENVIRONMENT_IS_SHELL) {
  Module['print'] = print;
  if (typeof printErr != 'undefined') Module['printErr'] = printErr; // not present in v8 or older sm
  Module['read'] = read;
  Module['readBinary'] = function(f) {
    return read(f, 'binary');
  };
  if (typeof scriptArgs != 'undefined') {
    Module['arguments'] = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) {
  Module['print'] = function(x) {
    console.log(x);
  };
  Module['printErr'] = function(x) {
    console.log(x);
  };
  this['Module'] = Module;
}
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  Module['read'] = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.send(null);
    return xhr.responseText;
  };
  if (typeof arguments != 'undefined') {
    Module['arguments'] = arguments;
  }
}
if (ENVIRONMENT_IS_WORKER) {
  // We can do very little here...
  var TRY_USE_DUMP = false;
  Module['print'] = (TRY_USE_DUMP && (typeof(dump) !== "undefined") ? (function(x) {
    dump(x);
  }) : (function(x) {
    // self.postMessage(x); // enable this if you want stdout to be sent as messages
  }));
  Module['load'] = importScripts;
}
if (!ENVIRONMENT_IS_WORKER && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_SHELL) {
  // Unreachable because SHELL is dependant on the others
  throw 'Unknown runtime environment. Where are we?';
}
function globalEval(x) {
  eval.call(null, x);
}
if (!Module['load'] == 'undefined' && Module['read']) {
  Module['load'] = function(f) {
    globalEval(Module['read'](f));
  };
}
if (!Module['print']) {
  Module['print'] = function(){};
}
if (!Module['printErr']) {
  Module['printErr'] = Module['print'];
}
if (!Module['arguments']) {
  Module['arguments'] = [];
}
// *** Environment setup code ***
// Closure helpers
Module.print = Module['print'];
Module.printErr = Module['printErr'];
// Callbacks
Module['preRun'] = [];
Module['postRun'] = [];
// Merge back in the overrides
for (var key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// === Auto-generated preamble library stuff ===
//========================================
// Runtime code shared with compiler
//========================================
var Runtime = {
  stackSave: function () {
    return STACKTOP;
  },
  stackRestore: function (stackTop) {
    STACKTOP = stackTop;
  },
  forceAlign: function (target, quantum) {
    quantum = quantum || 4;
    if (quantum == 1) return target;
    if (isNumber(target) && isNumber(quantum)) {
      return Math.ceil(target/quantum)*quantum;
    } else if (isNumber(quantum) && isPowerOfTwo(quantum)) {
      var logg = log2(quantum);
      return '((((' +target + ')+' + (quantum-1) + ')>>' + logg + ')<<' + logg + ')';
    }
    return 'Math.ceil((' + target + ')/' + quantum + ')*' + quantum;
  },
  isNumberType: function (type) {
    return type in Runtime.INT_TYPES || type in Runtime.FLOAT_TYPES;
  },
  isPointerType: function isPointerType(type) {
  return type[type.length-1] == '*';
},
  isStructType: function isStructType(type) {
  if (isPointerType(type)) return false;
  if (isArrayType(type)) return true;
  if (/<?{ ?[^}]* ?}>?/.test(type)) return true; // { i32, i8 } etc. - anonymous struct types
  // See comment in isStructPointerType()
  return type[0] == '%';
},
  INT_TYPES: {"i1":0,"i8":0,"i16":0,"i32":0,"i64":0},
  FLOAT_TYPES: {"float":0,"double":0},
  or64: function (x, y) {
    var l = (x | 0) | (y | 0);
    var h = (Math.round(x / 4294967296) | Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  and64: function (x, y) {
    var l = (x | 0) & (y | 0);
    var h = (Math.round(x / 4294967296) & Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  xor64: function (x, y) {
    var l = (x | 0) ^ (y | 0);
    var h = (Math.round(x / 4294967296) ^ Math.round(y / 4294967296)) * 4294967296;
    return l + h;
  },
  getNativeTypeSize: function (type, quantumSize) {
    if (Runtime.QUANTUM_SIZE == 1) return 1;
    var size = {
      '%i1': 1,
      '%i8': 1,
      '%i16': 2,
      '%i32': 4,
      '%i64': 8,
      "%float": 4,
      "%double": 8
    }['%'+type]; // add '%' since float and double confuse Closure compiler as keys, and also spidermonkey as a compiler will remove 's from '_i8' etc
    if (!size) {
      if (type.charAt(type.length-1) == '*') {
        size = Runtime.QUANTUM_SIZE; // A pointer
      } else if (type[0] == 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 == 0);
        size = bits/8;
      }
    }
    return size;
  },
  getNativeFieldSize: function (type) {
    return Math.max(Runtime.getNativeTypeSize(type), Runtime.QUANTUM_SIZE);
  },
  dedup: function dedup(items, ident) {
  var seen = {};
  if (ident) {
    return items.filter(function(item) {
      if (seen[item[ident]]) return false;
      seen[item[ident]] = true;
      return true;
    });
  } else {
    return items.filter(function(item) {
      if (seen[item]) return false;
      seen[item] = true;
      return true;
    });
  }
},
  set: function set() {
  var args = typeof arguments[0] === 'object' ? arguments[0] : arguments;
  var ret = {};
  for (var i = 0; i < args.length; i++) {
    ret[args[i]] = 0;
  }
  return ret;
},
  STACK_ALIGN: 8,
  getAlignSize: function (type, size, vararg) {
    // we align i64s and doubles on 64-bit boundaries, unlike x86
    if (type == 'i64' || type == 'double' || vararg) return 8;
    if (!type) return Math.min(size, 8); // align structures internally to 64 bits
    return Math.min(size || (type ? Runtime.getNativeFieldSize(type) : 0), Runtime.QUANTUM_SIZE);
  },
  calculateStructAlignment: function calculateStructAlignment(type) {
    type.flatSize = 0;
    type.alignSize = 0;
    var diffs = [];
    var prev = -1;
    var index = 0;
    type.flatIndexes = type.fields.map(function(field) {
      index++;
      var size, alignSize;
      if (Runtime.isNumberType(field) || Runtime.isPointerType(field)) {
        size = Runtime.getNativeTypeSize(field); // pack char; char; in structs, also char[X]s.
        alignSize = Runtime.getAlignSize(field, size);
      } else if (Runtime.isStructType(field)) {
        if (field[1] === '0') {
          // this is [0 x something]. When inside another structure like here, it must be at the end,
          // and it adds no size
          // XXX this happens in java-nbody for example... assert(index === type.fields.length, 'zero-length in the middle!');
          size = 0;
          alignSize = type.alignSize || QUANTUM_SIZE;
        } else {
          size = Types.types[field].flatSize;
          alignSize = Runtime.getAlignSize(null, Types.types[field].alignSize);
        }
      } else if (field[0] == 'b') {
        // bN, large number field, like a [N x i8]
        size = field.substr(1)|0;
        alignSize = 1;
      } else {
        throw 'Unclear type in struct: ' + field + ', in ' + type.name_ + ' :: ' + dump(Types.types[type.name_]);
      }
      if (type.packed) alignSize = 1;
      type.alignSize = Math.max(type.alignSize, alignSize);
      var curr = Runtime.alignMemory(type.flatSize, alignSize); // if necessary, place this on aligned memory
      type.flatSize = curr + size;
      if (prev >= 0) {
        diffs.push(curr-prev);
      }
      prev = curr;
      return curr;
    });
    type.flatSize = Runtime.alignMemory(type.flatSize, type.alignSize);
    if (diffs.length == 0) {
      type.flatFactor = type.flatSize;
    } else if (Runtime.dedup(diffs).length == 1) {
      type.flatFactor = diffs[0];
    }
    type.needsFlattening = (type.flatFactor != 1);
    return type.flatIndexes;
  },
  generateStructInfo: function (struct, typeName, offset) {
    var type, alignment;
    if (typeName) {
      offset = offset || 0;
      type = (typeof Types === 'undefined' ? Runtime.typeInfo : Types.types)[typeName];
      if (!type) return null;
      if (type.fields.length != struct.length) {
        printErr('Number of named fields must match the type for ' + typeName + ': possibly duplicate struct names. Cannot return structInfo');
        return null;
      }
      alignment = type.flatIndexes;
    } else {
      var type = { fields: struct.map(function(item) { return item[0] }) };
      alignment = Runtime.calculateStructAlignment(type);
    }
    var ret = {
      __size__: type.flatSize
    };
    if (typeName) {
      struct.forEach(function(item, i) {
        if (typeof item === 'string') {
          ret[item] = alignment[i] + offset;
        } else {
          // embedded struct
          var key;
          for (var k in item) key = k;
          ret[key] = Runtime.generateStructInfo(item[key], type.fields[i], alignment[i]);
        }
      });
    } else {
      struct.forEach(function(item, i) {
        ret[item[1]] = alignment[i];
      });
    }
    return ret;
  },
  dynCall: function (sig, ptr, args) {
    if (args && args.length) {
      if (!args.splice) args = Array.prototype.slice.call(args);
      args.splice(0, 0, ptr);
      return Module['dynCall_' + sig].apply(null, args);
    } else {
      return Module['dynCall_' + sig].call(null, ptr);
    }
  },
  functionPointers: [],
  addFunction: function (func) {
    for (var i = 0; i < Runtime.functionPointers.length; i++) {
      if (!Runtime.functionPointers[i]) {
        Runtime.functionPointers[i] = func;
        return 2 + 2*i;
      }
    }
    throw 'Finished up all reserved function pointers. Use a higher value for RESERVED_FUNCTION_POINTERS.';
  },
  removeFunction: function (index) {
    Runtime.functionPointers[(index-2)/2] = null;
  },
  warnOnce: function (text) {
    if (!Runtime.warnOnce.shown) Runtime.warnOnce.shown = {};
    if (!Runtime.warnOnce.shown[text]) {
      Runtime.warnOnce.shown[text] = 1;
      Module.printErr(text);
    }
  },
  funcWrappers: {},
  getFuncWrapper: function (func, sig) {
    assert(sig);
    if (!Runtime.funcWrappers[func]) {
      Runtime.funcWrappers[func] = function() {
        return Runtime.dynCall(sig, func, arguments);
      };
    }
    return Runtime.funcWrappers[func];
  },
  UTF8Processor: function () {
    var buffer = [];
    var needed = 0;
    this.processCChar = function (code) {
      code = code & 0xff;
      if (needed) {
        buffer.push(code);
        needed--;
      }
      if (buffer.length == 0) {
        if (code < 128) return String.fromCharCode(code);
        buffer.push(code);
        if (code > 191 && code < 224) {
          needed = 1;
        } else {
          needed = 2;
        }
        return '';
      }
      if (needed > 0) return '';
      var c1 = buffer[0];
      var c2 = buffer[1];
      var c3 = buffer[2];
      var ret;
      if (c1 > 191 && c1 < 224) {
        ret = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
      } else {
        ret = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      }
      buffer.length = 0;
      return ret;
    }
    this.processJSString = function(string) {
      string = unescape(encodeURIComponent(string));
      var ret = [];
      for (var i = 0; i < string.length; i++) {
        ret.push(string.charCodeAt(i));
      }
      return ret;
    }
  },
  stackAlloc: function (size) { var ret = STACKTOP;STACKTOP = (STACKTOP + size)|0;STACKTOP = ((((STACKTOP)+7)>>3)<<3); return ret; },
  staticAlloc: function (size) { var ret = STATICTOP;STATICTOP = (STATICTOP + size)|0;STATICTOP = ((((STATICTOP)+7)>>3)<<3); return ret; },
  dynamicAlloc: function (size) { var ret = DYNAMICTOP;DYNAMICTOP = (DYNAMICTOP + size)|0;DYNAMICTOP = ((((DYNAMICTOP)+7)>>3)<<3); if (DYNAMICTOP >= TOTAL_MEMORY) enlargeMemory();; return ret; },
  alignMemory: function (size,quantum) { var ret = size = Math.ceil((size)/(quantum ? quantum : 8))*(quantum ? quantum : 8); return ret; },
  makeBigInt: function (low,high,unsigned) { var ret = (unsigned ? ((+(((low)>>>(0))))+((+(((high)>>>(0))))*(+(4294967296)))) : ((+(((low)>>>(0))))+((+(((high)|(0))))*(+(4294967296))))); return ret; },
  GLOBAL_BASE: 8,
  QUANTUM_SIZE: 4,
  __dummy__: 0
}
//========================================
// Runtime essentials
//========================================
var __THREW__ = 0; // Used in checking for thrown exceptions.
var ABORT = false; // whether we are quitting the application. no code should run after this. set in exit() and abort()
var undef = 0;
// tempInt is used for 32-bit signed values or smaller. tempBigInt is used
// for 32-bit unsigned values or more than 32 bits. TODO: audit all uses of tempInt
var tempValue, tempInt, tempBigInt, tempInt2, tempBigInt2, tempPair, tempBigIntI, tempBigIntR, tempBigIntS, tempBigIntP, tempBigIntD;
var tempI64, tempI64b;
var tempRet0, tempRet1, tempRet2, tempRet3, tempRet4, tempRet5, tempRet6, tempRet7, tempRet8, tempRet9;
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}
var globalScope = this;
// C calling interface. A convenient way to call C functions (in C files, or
// defined with extern "C").
//
// Note: LLVM optimizations can inline and remove functions, after which you will not be
//       able to call them. Closure can also do so. To avoid that, add your function to
//       the exports using something like
//
//         -s EXPORTED_FUNCTIONS='["_main", "_myfunc"]'
//
// @param ident      The name of the C function (note that C++ functions will be name-mangled - use extern "C")
// @param returnType The return type of the function, one of the JS types 'number', 'string' or 'array' (use 'number' for any C pointer, and
//                   'array' for JavaScript arrays and typed arrays; note that arrays are 8-bit).
// @param argTypes   An array of the types of arguments for the function (if there are no arguments, this can be ommitted). Types are as in returnType,
//                   except that 'array' is not possible (there is no way for us to know the length of the array)
// @param args       An array of the arguments to the function, as native JS values (as in returnType)
//                   Note that string arguments will be stored on the stack (the JS string will become a C string on the stack).
// @return           The return value, as a native JS value (as in returnType)
function ccall(ident, returnType, argTypes, args) {
  return ccallFunc(getCFunc(ident), returnType, argTypes, args);
}
Module["ccall"] = ccall;
// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  try {
    var func = Module['_' + ident]; // closure exported function
    if (!func) func = eval('_' + ident); // explicit lookup
  } catch(e) {
  }
  assert(func, 'Cannot call unknown function ' + ident + ' (perhaps LLVM optimizations or closure removed it?)');
  return func;
}
// Internal function that does a C call using a function, not an identifier
function ccallFunc(func, returnType, argTypes, args) {
  var stack = 0;
  function toC(value, type) {
    if (type == 'string') {
      if (value === null || value === undefined || value === 0) return 0; // null string
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length+1);
      writeStringToMemory(value, ret);
      return ret;
    } else if (type == 'array') {
      if (!stack) stack = Runtime.stackSave();
      var ret = Runtime.stackAlloc(value.length);
      writeArrayToMemory(value, ret);
      return ret;
    }
    return value;
  }
  function fromC(value, type) {
    if (type == 'string') {
      return Pointer_stringify(value);
    }
    assert(type != 'array');
    return value;
  }
  var i = 0;
  var cArgs = args ? args.map(function(arg) {
    return toC(arg, argTypes[i++]);
  }) : [];
  var ret = fromC(func.apply(null, cArgs), returnType);
  if (stack) Runtime.stackRestore(stack);
  return ret;
}
// Returns a native JS wrapper for a C function. This is similar to ccall, but
// returns a function you can call repeatedly in a normal way. For example:
//
//   var my_function = cwrap('my_c_function', 'number', ['number', 'number']);
//   alert(my_function(5, 22));
//   alert(my_function(99, 12));
//
function cwrap(ident, returnType, argTypes) {
  var func = getCFunc(ident);
  return function() {
    return ccallFunc(func, returnType, argTypes, Array.prototype.slice.call(arguments));
  }
}
Module["cwrap"] = cwrap;
// Sets a value in memory in a dynamic way at run-time. Uses the
// type data. This is the same as makeSetValue, except that
// makeSetValue is done at compile-time and generates the needed
// code then, whereas this function picks the right code at
// run-time.
// Note that setValue and getValue only do *aligned* writes and reads!
// Note that ccall uses JS types as for defining types, while setValue and
// getValue need LLVM types ('i8', 'i32') - this is a lower-level operation
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[(ptr)]=value; break;
      case 'i8': HEAP8[(ptr)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,((Math.min((+(Math.floor((value)/(+(4294967296))))), (+(4294967295))))|0)>>>0],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}
Module['setValue'] = setValue;
// Parallel to setValue.
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[(ptr)];
      case 'i8': return HEAP8[(ptr)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for setValue: ' + type);
    }
  return null;
}
Module['getValue'] = getValue;
var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_STATIC = 2; // Cannot be freed
var ALLOC_DYNAMIC = 3; // Cannot be freed except through sbrk
var ALLOC_NONE = 4; // Do not allocate
Module['ALLOC_NORMAL'] = ALLOC_NORMAL;
Module['ALLOC_STACK'] = ALLOC_STACK;
Module['ALLOC_STATIC'] = ALLOC_STATIC;
Module['ALLOC_DYNAMIC'] = ALLOC_DYNAMIC;
Module['ALLOC_NONE'] = ALLOC_NONE;
// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }
  var singleType = typeof types === 'string' ? types : null;
  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc, Runtime.stackAlloc, Runtime.staticAlloc, Runtime.dynamicAlloc][allocator === undefined ? ALLOC_STATIC : allocator](Math.max(size, singleType ? 1 : types.length));
  }
  if (zeroinit) {
    var ptr = ret, stop;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)|0)]=0;
    }
    return ret;
  }
  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(slab, ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }
  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];
    if (typeof curr === 'function') {
      curr = Runtime.getFunctionIndex(curr);
    }
    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }
    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later
    setValue(ret+i, curr, type);
    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = Runtime.getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }
  return ret;
}
Module['allocate'] = allocate;
function Pointer_stringify(ptr, /* optional */ length) {
  // Find the length, and check for UTF while doing so
  var hasUtf = false;
  var t;
  var i = 0;
  while (1) {
    t = HEAPU8[(((ptr)+(i))|0)];
    if (t >= 128) hasUtf = true;
    else if (t == 0 && !length) break;
    i++;
    if (length && i == length) break;
  }
  if (!length) length = i;
  var ret = '';
  if (!hasUtf) {
    var MAX_CHUNK = 1024; // split up into chunks, because .apply on a huge string can overflow the stack
    var curr;
    while (length > 0) {
      curr = String.fromCharCode.apply(String, HEAPU8.subarray(ptr, ptr + Math.min(length, MAX_CHUNK)));
      ret = ret ? ret + curr : curr;
      ptr += MAX_CHUNK;
      length -= MAX_CHUNK;
    }
    return ret;
  }
  var utf8 = new Runtime.UTF8Processor();
  for (i = 0; i < length; i++) {
    t = HEAPU8[(((ptr)+(i))|0)];
    ret += utf8.processCChar(t);
  }
  return ret;
}
Module['Pointer_stringify'] = Pointer_stringify;
// Memory management
var PAGE_SIZE = 4096;
function alignMemoryPage(x) {
  return ((x+4095)>>12)<<12;
}
var HEAP;
var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
var STATIC_BASE = 0, STATICTOP = 0, staticSealed = false; // static area
var STACK_BASE = 0, STACKTOP = 0, STACK_MAX = 0; // stack area
var DYNAMIC_BASE = 0, DYNAMICTOP = 0; // dynamic area handled by sbrk
function enlargeMemory() {
  abort('Cannot enlarge memory arrays in asm.js. Either (1) compile with -s TOTAL_MEMORY=X with X higher than the current value, or (2) set Module.TOTAL_MEMORY before the program runs.');
}
var TOTAL_STACK = Module['TOTAL_STACK'] || 5242880;
var TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;
var FAST_MEMORY = Module['FAST_MEMORY'] || 2097152;
// Initialize the runtime's memory
// check for full engine support (use string 'subarray' to avoid closure compiler confusion)
assert(!!Int32Array && !!Float64Array && !!(new Int32Array(1)['subarray']) && !!(new Int32Array(1)['set']),
       'Cannot fallback to non-typed array case: Code is too specialized');
var buffer = new ArrayBuffer(TOTAL_MEMORY);
HEAP8 = new Int8Array(buffer);
HEAP16 = new Int16Array(buffer);
HEAP32 = new Int32Array(buffer);
HEAPU8 = new Uint8Array(buffer);
HEAPU16 = new Uint16Array(buffer);
HEAPU32 = new Uint32Array(buffer);
HEAPF32 = new Float32Array(buffer);
HEAPF64 = new Float64Array(buffer);
// Endianness check (note: assumes compiler arch was little-endian)
HEAP32[0] = 255;
assert(HEAPU8[0] === 255 && HEAPU8[3] === 0, 'Typed arrays 2 must be run on a little-endian system');
Module['HEAP'] = HEAP;
Module['HEAP8'] = HEAP8;
Module['HEAP16'] = HEAP16;
Module['HEAP32'] = HEAP32;
Module['HEAPU8'] = HEAPU8;
Module['HEAPU16'] = HEAPU16;
Module['HEAPU32'] = HEAPU32;
Module['HEAPF32'] = HEAPF32;
Module['HEAPF64'] = HEAPF64;
function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Runtime.dynCall('v', func);
      } else {
        Runtime.dynCall('vi', func, [callback.arg]);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the runtime has exited
var runtimeInitialized = false;
function preRun() {
  // compatibility - merge in anything from Module['preRun'] at this time
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPRERUN__);
}
function ensureInitRuntime() {
  if (runtimeInitialized) return;
  runtimeInitialized = true;
  callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
  callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
  callRuntimeCallbacks(__ATEXIT__);
}
function postRun() {
  // compatibility - merge in anything from Module['postRun'] at this time
  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }
  callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}
Module['addOnPreRun'] = Module.addOnPreRun = addOnPreRun;
function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}
Module['addOnInit'] = Module.addOnInit = addOnInit;
function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}
Module['addOnPreMain'] = Module.addOnPreMain = addOnPreMain;
function addOnExit(cb) {
  __ATEXIT__.unshift(cb);
}
Module['addOnExit'] = Module.addOnExit = addOnExit;
function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}
Module['addOnPostRun'] = Module.addOnPostRun = addOnPostRun;
// Tools
// This processes a JS string into a C-line array of numbers, 0-terminated.
// For LLVM-originating strings, see parser.js:parseLLVMString function
function intArrayFromString(stringy, dontAddNull, length /* optional */) {
  var ret = (new Runtime.UTF8Processor()).processJSString(stringy);
  if (length) {
    ret.length = length;
  }
  if (!dontAddNull) {
    ret.push(0);
  }
  return ret;
}
Module['intArrayFromString'] = intArrayFromString;
function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}
Module['intArrayToString'] = intArrayToString;
// Write a Javascript array to somewhere in the heap
function writeStringToMemory(string, buffer, dontAddNull) {
  var array = intArrayFromString(string, dontAddNull);
  var i = 0;
  while (i < array.length) {
    var chr = array[i];
    HEAP8[(((buffer)+(i))|0)]=chr
    i = i + 1;
  }
}
Module['writeStringToMemory'] = writeStringToMemory;
function writeArrayToMemory(array, buffer) {
  for (var i = 0; i < array.length; i++) {
    HEAP8[(((buffer)+(i))|0)]=array[i];
  }
}
Module['writeArrayToMemory'] = writeArrayToMemory;
function unSign(value, bits, ignore, sig) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore, sig) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}
if (!Math['imul']) Math['imul'] = function(a, b) {
  var ah  = a >>> 16;
  var al = a & 0xffff;
  var bh  = b >>> 16;
  var bl = b & 0xffff;
  return (al*bl + ((ah*bl + al*bh) << 16))|0;
};
Math.imul = Math['imul'];
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// PRE_RUN_ADDITIONS (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyTracking = {};
var calledInit = false, calledRun = false;
var runDependencyWatcher = null;
function addRunDependency(id) {
  runDependencies++;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(!runDependencyTracking[id]);
    runDependencyTracking[id] = 1;
  } else {
    Module.printErr('warning: run dependency added without ID');
  }
}
Module['addRunDependency'] = addRunDependency;
function removeRunDependency(id) {
  runDependencies--;
  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }
  if (id) {
    assert(runDependencyTracking[id]);
    delete runDependencyTracking[id];
  } else {
    Module.printErr('warning: run dependency removed without ID');
  }
  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    } 
    // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
    if (!calledRun && shouldRunNow) run();
  }
}
Module['removeRunDependency'] = removeRunDependency;
Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data
function loadMemoryInitializer(filename) {
  function applyData(data) {
    HEAPU8.set(data, STATIC_BASE);
  }
  // always do this asynchronously, to keep shell and web as similar as possible
  addOnPreRun(function() {
    if (ENVIRONMENT_IS_NODE || ENVIRONMENT_IS_SHELL) {
      applyData(Module['readBinary'](filename));
    } else {
      Browser.asyncLoad(filename, function(data) {
        applyData(data);
      }, function(data) {
        throw 'could not load memory initializer ' + filename;
      });
    }
  });
}
// === Body ===
STATIC_BASE = 8;
STATICTOP = STATIC_BASE + 19344;
/* global initializers */ __ATINIT__.push({ func: function() { runPostSets() } });
var _stderr;
var _stderr = _stderr=allocate([0,0,0,0,0,0,0,0], "i8", ALLOC_STATIC);
/* memory initializer */ allocate([117,110,107,110,111,119,110,32,99,111,109,112,114,101,115,115,105,111,110,32,109,101,116,104,111,100,58,32,37,100,0,0,117,110,107,110,111,119,110,32,97,114,99,104,105,118,101,32,116,121,112,101,44,32,111,110,108,121,32,112,108,97,105,110,32,82,65,82,32,50,46,48,32,115,117,112,112,111,114,116,101,100,40,110,111,114,109,97,108,32,97,110,100,32,115,111,108,105,100,32,97,114,99,104,105,118,101,115,41,44,32,83,70,88,32,97,110,100,32,86,111,108,117,109,101,115,32,97,114,101,32,78,79,84,32,115,117,112,112,111,114,116,101,100,33,10,0,0,0,0,0,0,114,0,0,0,0,0,0,0,0,4,8,16,32,64,128,192,2,2,3,4,5,6,6,6,0,1,2,3,4,5,6,7,8,10,12,14,16,20,24,28,32,40,48,56,64,80,96,112,128,160,192,224,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0,0,0,0,0,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,48,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,192,0,0,0,0,1,0,0,128,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,6,0,0,0,8,0,0,0,12,0,0,0,16,0,0,0,24,0,0,0,32,0,0,0,48,0,0,0,64,0,0,0,96,0,0,0,128,0,0,0,192,0,0,0,0,1,0,0,128,1,0,0,0,2,0,0,0,3,0,0,0,4,0,0,0,5,0,0,0,6,0,0,0,7,0,0,0,8,0,0,0,9,0,0,0,10,0,0,0,11,0,0,0,12,0,0,0,13,0,0,0,14,0,0,0,15,0,0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,240,11,0,0,120,16,0,0,0,21,0,0,136,25,0,0,215,19,149,35,73,197,192,205,249,28,16,119,48,221,2,42,232,1,177,233,14,88,219,25,223,195,244,90,87,239,153,137,255,199,147,70,92,66,246,13,216,40,62,29,217,230,86,6,71,24,171,196,101,113,218,123,93,91,163,178,202,67,44,235,107,250,75,234,49,167,125,211,83,114,157,144,32,193,143,36,158,124,247,187,89,214,141,47,121,228,61,130,213,194,174,251,97,110,54,229,115,57,152,94,105,243,212,55,209,245,63,11,164,200,31,156,81,176,227,21,76,99,139,188,127,17,248,51,207,120,189,210,8,226,41,72,183,203,135,165,166,60,98,7,122,38,155,170,69,172,252,238,39,134,59,128,236,27,240,80,131,3,85,206,145,79,154,142,159,220,201,133,74,64,20,129,224,185,138,103,173,182,43,34,254,82,198,151,231,180,58,10,118,26,102,12,50,132,22,191,136,111,162,179,45,4,148,108,161,56,78,126,242,222,15,175,146,23,33,241,181,190,77,225,0,46,169,186,68,95,237,65,53,208,253,168,9,18,100,52,116,184,160,96,109,37,30,106,140,104,150,5,204,117,112,84], "i8", ALLOC_NONE, Runtime.GLOBAL_BASE)
var tempDoublePtr = Runtime.alignMemory(allocate(12, "i8", ALLOC_STATIC), 8);
assert(tempDoublePtr % 8 == 0);
function copyTempFloat(ptr) { // functions, because inlining this code increases code size too much
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
}
function copyTempDouble(ptr) {
  HEAP8[tempDoublePtr] = HEAP8[ptr];
  HEAP8[tempDoublePtr+1] = HEAP8[ptr+1];
  HEAP8[tempDoublePtr+2] = HEAP8[ptr+2];
  HEAP8[tempDoublePtr+3] = HEAP8[ptr+3];
  HEAP8[tempDoublePtr+4] = HEAP8[ptr+4];
  HEAP8[tempDoublePtr+5] = HEAP8[ptr+5];
  HEAP8[tempDoublePtr+6] = HEAP8[ptr+6];
  HEAP8[tempDoublePtr+7] = HEAP8[ptr+7];
}
  Module["_strlen"] = _strlen;function _strdup(ptr) {
      var len = _strlen(ptr);
      var newStr = _malloc(len + 1);
      (_memcpy(newStr, ptr, len)|0);
      HEAP8[(((newStr)+(len))|0)]=0;
      return newStr;
    }
  var ERRNO_CODES={EPERM:1,ENOENT:2,ESRCH:3,EINTR:4,EIO:5,ENXIO:6,E2BIG:7,ENOEXEC:8,EBADF:9,ECHILD:10,EAGAIN:11,EWOULDBLOCK:11,ENOMEM:12,EACCES:13,EFAULT:14,ENOTBLK:15,EBUSY:16,EEXIST:17,EXDEV:18,ENODEV:19,ENOTDIR:20,EISDIR:21,EINVAL:22,ENFILE:23,EMFILE:24,ENOTTY:25,ETXTBSY:26,EFBIG:27,ENOSPC:28,ESPIPE:29,EROFS:30,EMLINK:31,EPIPE:32,EDOM:33,ERANGE:34,ENOMSG:35,EIDRM:36,ECHRNG:37,EL2NSYNC:38,EL3HLT:39,EL3RST:40,ELNRNG:41,EUNATCH:42,ENOCSI:43,EL2HLT:44,EDEADLK:45,ENOLCK:46,EBADE:50,EBADR:51,EXFULL:52,ENOANO:53,EBADRQC:54,EBADSLT:55,EDEADLOCK:56,EBFONT:57,ENOSTR:60,ENODATA:61,ETIME:62,ENOSR:63,ENONET:64,ENOPKG:65,EREMOTE:66,ENOLINK:67,EADV:68,ESRMNT:69,ECOMM:70,EPROTO:71,EMULTIHOP:74,ELBIN:75,EDOTDOT:76,EBADMSG:77,EFTYPE:79,ENOTUNIQ:80,EBADFD:81,EREMCHG:82,ELIBACC:83,ELIBBAD:84,ELIBSCN:85,ELIBMAX:86,ELIBEXEC:87,ENOSYS:88,ENMFILE:89,ENOTEMPTY:90,ENAMETOOLONG:91,ELOOP:92,EOPNOTSUPP:95,EPFNOSUPPORT:96,ECONNRESET:104,ENOBUFS:105,EAFNOSUPPORT:106,EPROTOTYPE:107,ENOTSOCK:108,ENOPROTOOPT:109,ESHUTDOWN:110,ECONNREFUSED:111,EADDRINUSE:112,ECONNABORTED:113,ENETUNREACH:114,ENETDOWN:115,ETIMEDOUT:116,EHOSTDOWN:117,EHOSTUNREACH:118,EINPROGRESS:119,EALREADY:120,EDESTADDRREQ:121,EMSGSIZE:122,EPROTONOSUPPORT:123,ESOCKTNOSUPPORT:124,EADDRNOTAVAIL:125,ENETRESET:126,EISCONN:127,ENOTCONN:128,ETOOMANYREFS:129,EPROCLIM:130,EUSERS:131,EDQUOT:132,ESTALE:133,ENOTSUP:134,ENOMEDIUM:135,ENOSHARE:136,ECASECLASH:137,EILSEQ:138,EOVERFLOW:139,ECANCELED:140,ENOTRECOVERABLE:141,EOWNERDEAD:142,ESTRPIPE:143};
  var ___errno_state=0;function ___setErrNo(value) {
      // For convenient setting and returning of errno.
      HEAP32[((___errno_state)>>2)]=value
      return value;
    }
  var _stdin=allocate(1, "i32*", ALLOC_STATIC);
  var _stdout=allocate(1, "i32*", ALLOC_STATIC);
  var _stderr=allocate(1, "i32*", ALLOC_STATIC);
  var __impure_ptr=allocate(1, "i32*", ALLOC_STATIC);var FS={currentPath:"/",nextInode:2,streams:[null],ignorePermissions:true,createFileHandle:function (stream, fd) {
        if (typeof stream === 'undefined') {
          stream = null;
        }
        if (!fd) {
          if (stream && stream.socket) {
            for (var i = 1; i < 64; i++) {
              if (!FS.streams[i]) {
                fd = i;
                break;
              }
            }
            assert(fd, 'ran out of low fds for sockets');
          } else {
            fd = Math.max(FS.streams.length, 64);
            for (var i = FS.streams.length; i < fd; i++) {
              FS.streams[i] = null; // Keep dense
            }
          }
        }
        // Close WebSocket first if we are about to replace the fd (i.e. dup2)
        if (FS.streams[fd] && FS.streams[fd].socket && FS.streams[fd].socket.close) {
          FS.streams[fd].socket.close();
        }
        FS.streams[fd] = stream;
        return fd;
      },removeFileHandle:function (fd) {
        FS.streams[fd] = null;
      },joinPath:function (parts, forceRelative) {
        var ret = parts[0];
        for (var i = 1; i < parts.length; i++) {
          if (ret[ret.length-1] != '/') ret += '/';
          ret += parts[i];
        }
        if (forceRelative && ret[0] == '/') ret = ret.substr(1);
        return ret;
      },absolutePath:function (relative, base) {
        if (typeof relative !== 'string') return null;
        if (base === undefined) base = FS.currentPath;
        if (relative && relative[0] == '/') base = '';
        var full = base + '/' + relative;
        var parts = full.split('/').reverse();
        var absolute = [''];
        while (parts.length) {
          var part = parts.pop();
          if (part == '' || part == '.') {
            // Nothing.
          } else if (part == '..') {
            if (absolute.length > 1) absolute.pop();
          } else {
            absolute.push(part);
          }
        }
        return absolute.length == 1 ? '/' : absolute.join('/');
      },analyzePath:function (path, dontResolveLastLink, linksVisited) {
        var ret = {
          isRoot: false,
          exists: false,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: false,
          parentPath: null,
          parentObject: null
        };
        path = FS.absolutePath(path);
        if (path == '/') {
          ret.isRoot = true;
          ret.exists = ret.parentExists = true;
          ret.name = '/';
          ret.path = ret.parentPath = '/';
          ret.object = ret.parentObject = FS.root;
        } else if (path !== null) {
          linksVisited = linksVisited || 0;
          path = path.slice(1).split('/');
          var current = FS.root;
          var traversed = [''];
          while (path.length) {
            if (path.length == 1 && current.isFolder) {
              ret.parentExists = true;
              ret.parentPath = traversed.length == 1 ? '/' : traversed.join('/');
              ret.parentObject = current;
              ret.name = path[0];
            }
            var target = path.shift();
            if (!current.isFolder) {
              ret.error = ERRNO_CODES.ENOTDIR;
              break;
            } else if (!current.read) {
              ret.error = ERRNO_CODES.EACCES;
              break;
            } else if (!current.contents.hasOwnProperty(target)) {
              ret.error = ERRNO_CODES.ENOENT;
              break;
            }
            current = current.contents[target];
            if (current.link && !(dontResolveLastLink && path.length == 0)) {
              if (linksVisited > 40) { // Usual Linux SYMLOOP_MAX.
                ret.error = ERRNO_CODES.ELOOP;
                break;
              }
              var link = FS.absolutePath(current.link, traversed.join('/'));
              ret = FS.analyzePath([link].concat(path).join('/'),
                                   dontResolveLastLink, linksVisited + 1);
              return ret;
            }
            traversed.push(target);
            if (path.length == 0) {
              ret.exists = true;
              ret.path = traversed.join('/');
              ret.object = current;
            }
          }
        }
        return ret;
      },findObject:function (path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (ret.exists) {
          return ret.object;
        } else {
          ___setErrNo(ret.error);
          return null;
        }
      },createObject:function (parent, name, properties, canRead, canWrite) {
        if (!parent) parent = '/';
        if (typeof parent === 'string') parent = FS.findObject(parent);
        if (!parent) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent path must exist.');
        }
        if (!parent.isFolder) {
          ___setErrNo(ERRNO_CODES.ENOTDIR);
          throw new Error('Parent must be a folder.');
        }
        if (!parent.write && !FS.ignorePermissions) {
          ___setErrNo(ERRNO_CODES.EACCES);
          throw new Error('Parent folder must be writeable.');
        }
        if (!name || name == '.' || name == '..') {
          ___setErrNo(ERRNO_CODES.ENOENT);
          throw new Error('Name must not be empty.');
        }
        if (parent.contents.hasOwnProperty(name)) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          throw new Error("Can't overwrite object.");
        }
        parent.contents[name] = {
          read: canRead === undefined ? true : canRead,
          write: canWrite === undefined ? false : canWrite,
          timestamp: Date.now(),
          inodeNumber: FS.nextInode++
        };
        for (var key in properties) {
          if (properties.hasOwnProperty(key)) {
            parent.contents[name][key] = properties[key];
          }
        }
        return parent.contents[name];
      },createFolder:function (parent, name, canRead, canWrite) {
        var properties = {isFolder: true, isDevice: false, contents: {}};
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createPath:function (parent, path, canRead, canWrite) {
        var current = FS.findObject(parent);
        if (current === null) throw new Error('Invalid parent.');
        path = path.split('/').reverse();
        while (path.length) {
          var part = path.pop();
          if (!part) continue;
          if (!current.contents.hasOwnProperty(part)) {
            FS.createFolder(current, part, canRead, canWrite);
          }
          current = current.contents[part];
        }
        return current;
      },createFile:function (parent, name, properties, canRead, canWrite) {
        properties.isFolder = false;
        return FS.createObject(parent, name, properties, canRead, canWrite);
      },createDataFile:function (parent, name, data, canRead, canWrite) {
        if (typeof data === 'string') {
          var dataArray = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i) dataArray[i] = data.charCodeAt(i);
          data = dataArray;
        }
        var properties = {
          isDevice: false,
          contents: data.subarray ? data.subarray(0) : data // as an optimization, create a new array wrapper (not buffer) here, to help JS engines understand this object
        };
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createLazyFile:function (parent, name, url, canRead, canWrite) {
        if (typeof XMLHttpRequest !== 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          // Lazy chunked Uint8Array (implements get and length from Uint8Array). Actual getting is abstracted away for eventual reuse.
          var LazyUint8Array = function() {
            this.lengthKnown = false;
            this.chunks = []; // Loaded chunks. Index is the chunk number
          }
          LazyUint8Array.prototype.get = function(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = Math.floor(idx / this.chunkSize);
            return this.getter(chunkNum)[chunkOffset];
          }
          LazyUint8Array.prototype.setDataGetter = function(getter) {
            this.getter = getter;
          }
          LazyUint8Array.prototype.cacheLength = function() {
              // Find length
              var xhr = new XMLHttpRequest();
              xhr.open('HEAD', url, false);
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              var datalength = Number(xhr.getResponseHeader("Content-length"));
              var header;
              var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
              var chunkSize = 1024*1024; // Chunk size in bytes
              if (!hasByteServing) chunkSize = datalength;
              // Function to get a range from the remote URL.
              var doXHR = (function(from, to) {
                if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
                if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
                // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, false);
                if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
                // Some hints to the browser that we want binary data.
                if (typeof Uint8Array != 'undefined') xhr.responseType = 'arraybuffer';
                if (xhr.overrideMimeType) {
                  xhr.overrideMimeType('text/plain; charset=x-user-defined');
                }
                xhr.send(null);
                if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
                if (xhr.response !== undefined) {
                  return new Uint8Array(xhr.response || []);
                } else {
                  return intArrayFromString(xhr.responseText || '', true);
                }
              });
              var lazyArray = this;
              lazyArray.setDataGetter(function(chunkNum) {
                var start = chunkNum * chunkSize;
                var end = (chunkNum+1) * chunkSize - 1; // including this byte
                end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") {
                  lazyArray.chunks[chunkNum] = doXHR(start, end);
                }
                if (typeof(lazyArray.chunks[chunkNum]) === "undefined") throw new Error("doXHR failed!");
                return lazyArray.chunks[chunkNum];
              });
              this._length = datalength;
              this._chunkSize = chunkSize;
              this.lengthKnown = true;
          }
          var lazyArray = new LazyUint8Array();
          Object.defineProperty(lazyArray, "length", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._length;
              }
          });
          Object.defineProperty(lazyArray, "chunkSize", {
              get: function() {
                  if(!this.lengthKnown) {
                      this.cacheLength();
                  }
                  return this._chunkSize;
              }
          });
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createPreloadedFile:function (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile) {
        Browser.init();
        var fullname = FS.joinPath([parent, name], true);
        function processData(byteArray) {
          function finish(byteArray) {
            if (!dontCreateFile) {
              FS.createDataFile(parent, name, byteArray, canRead, canWrite);
            }
            if (onload) onload();
            removeRunDependency('cp ' + fullname);
          }
          var handled = false;
          Module['preloadPlugins'].forEach(function(plugin) {
            if (handled) return;
            if (plugin['canHandle'](fullname)) {
              plugin['handle'](byteArray, fullname, finish, function() {
                if (onerror) onerror();
                removeRunDependency('cp ' + fullname);
              });
              handled = true;
            }
          });
          if (!handled) finish(byteArray);
        }
        addRunDependency('cp ' + fullname);
        if (typeof url == 'string') {
          Browser.asyncLoad(url, function(byteArray) {
            processData(byteArray);
          }, onerror);
        } else {
          processData(url);
        }
      },createLink:function (parent, name, target, canRead, canWrite) {
        var properties = {isDevice: false, link: target};
        return FS.createFile(parent, name, properties, canRead, canWrite);
      },createDevice:function (parent, name, input, output) {
        if (!(input || output)) {
          throw new Error('A device must have at least one callback defined.');
        }
        var ops = {isDevice: true, input: input, output: output};
        return FS.createFile(parent, name, ops, Boolean(input), Boolean(output));
      },forceLoadFile:function (obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        var success = true;
        if (typeof XMLHttpRequest !== 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else if (Module['read']) {
          // Command-line.
          try {
            // WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
            //          read() will try to parse UTF8.
            obj.contents = intArrayFromString(Module['read'](obj.url), true);
          } catch (e) {
            success = false;
          }
        } else {
          throw new Error('Cannot load without read() or XMLHttpRequest.');
        }
        if (!success) ___setErrNo(ERRNO_CODES.EIO);
        return success;
      },staticInit:function () {
        // The main file system tree. All the contents are inside this.
        FS.root = {
          read: true,
          write: true,
          isFolder: true,
          isDevice: false,
          timestamp: Date.now(),
          inodeNumber: 1,
          contents: {}
        };
        // Create the temporary folder, if not already created
        try {
          FS.createFolder('/', 'tmp', true, true);
        } catch(e) {}
        FS.createFolder('/', 'dev', true, true);
      },init:function (input, output, error) {
        // Make sure we initialize only once.
        assert(!FS.init.initialized, 'FS.init was previously called. If you want to initialize later with custom parameters, remove any earlier calls (note that one is automatically added to the generated code)');
        FS.init.initialized = true;
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input = input || Module['stdin'];
        output = output || Module['stdout'];
        error = error || Module['stderr'];
        // Default handlers.
        var stdinOverridden = true, stdoutOverridden = true, stderrOverridden = true;
        if (!input) {
          stdinOverridden = false;
          input = function() {
            if (!input.cache || !input.cache.length) {
              var result;
              if (typeof window != 'undefined' &&
                  typeof window.prompt == 'function') {
                // Browser.
                result = window.prompt('Input: ');
                if (result === null) result = String.fromCharCode(0); // cancel ==> EOF
              } else if (typeof readline == 'function') {
                // Command line.
                result = readline();
              }
              if (!result) result = '';
              input.cache = intArrayFromString(result + '\n', true);
            }
            return input.cache.shift();
          };
        }
        var utf8 = new Runtime.UTF8Processor();
        function createSimpleOutput() {
          var fn = function (val) {
            if (val === null || val === 10) {
              fn.printer(fn.buffer.join(''));
              fn.buffer = [];
            } else {
              fn.buffer.push(utf8.processCChar(val));
            }
          };
          return fn;
        }
        if (!output) {
          stdoutOverridden = false;
          output = createSimpleOutput();
        }
        if (!output.printer) output.printer = Module['print'];
        if (!output.buffer) output.buffer = [];
        if (!error) {
          stderrOverridden = false;
          error = createSimpleOutput();
        }
        if (!error.printer) error.printer = Module['printErr'];
        if (!error.buffer) error.buffer = [];
        // Create the I/O devices.
        var stdin = FS.createDevice('/dev', 'stdin', input);
        stdin.isTerminal = !stdinOverridden;
        var stdout = FS.createDevice('/dev', 'stdout', null, output);
        stdout.isTerminal = !stdoutOverridden;
        var stderr = FS.createDevice('/dev', 'stderr', null, error);
        stderr.isTerminal = !stderrOverridden;
        FS.createDevice('/dev', 'tty', input, output);
        FS.createDevice('/dev', 'null', function(){}, function(){});
        // Create default streams.
        FS.streams[1] = {
          path: '/dev/stdin',
          object: stdin,
          position: 0,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[2] = {
          path: '/dev/stdout',
          object: stdout,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        FS.streams[3] = {
          path: '/dev/stderr',
          object: stderr,
          position: 0,
          isRead: false,
          isWrite: true,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: []
        };
        // TODO: put these low in memory like we used to assert on: assert(Math.max(_stdin, _stdout, _stderr) < 15000); // make sure these are low, we flatten arrays with these
        HEAP32[((_stdin)>>2)]=1;
        HEAP32[((_stdout)>>2)]=2;
        HEAP32[((_stderr)>>2)]=3;
        // Other system paths
        FS.createPath('/', 'dev/shm/tmp', true, true); // temp files
        // Newlib initialization
        for (var i = FS.streams.length; i < Math.max(_stdin, _stdout, _stderr) + 4; i++) {
          FS.streams[i] = null; // Make sure to keep FS.streams dense
        }
        FS.streams[_stdin] = FS.streams[1];
        FS.streams[_stdout] = FS.streams[2];
        FS.streams[_stderr] = FS.streams[3];
        allocate([ allocate(
          [0, 0, 0, 0, _stdin, 0, 0, 0, _stdout, 0, 0, 0, _stderr, 0, 0, 0],
          'void*', ALLOC_NORMAL) ], 'void*', ALLOC_NONE, __impure_ptr);
      },quit:function () {
        if (!FS.init.initialized) return;
        // Flush any partially-printed lines in stdout and stderr. Careful, they may have been closed
        if (FS.streams[2] && FS.streams[2].object.output.buffer.length > 0) FS.streams[2].object.output(10);
        if (FS.streams[3] && FS.streams[3].object.output.buffer.length > 0) FS.streams[3].object.output(10);
      },standardizePath:function (path) {
        if (path.substr(0, 2) == './') path = path.substr(2);
        return path;
      },deleteFile:function (path) {
        path = FS.analyzePath(path);
        if (!path.parentExists || !path.exists) {
          throw 'Invalid path ' + path;
        }
        delete path.parentObject.contents[path.name];
      }};Module['FS']=FS;function _close(fildes) {
      // int close(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/close.html
      if (FS.streams[fildes]) {
        if (FS.streams[fildes].currentEntry) {
          _free(FS.streams[fildes].currentEntry);
        }
        FS.streams[fildes] = null;
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _fsync(fildes) {
      // int fsync(int fildes);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fsync.html
      if (FS.streams[fildes]) {
        // We write directly to the file system, so there's nothing to do here.
        return 0;
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fclose(stream) {
      // int fclose(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fclose.html
      _fsync(stream);
      return _close(stream);
    }
  var ___dirent_struct_layout={__size__:1040,d_ino:0,d_name:4,d_off:1028,d_reclen:1032,d_type:1036};function _open(path, oflag, varargs) {
      // int open(const char *path, int oflag, ...);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/open.html
      // NOTE: This implementation tries to mimic glibc rather than strictly
      // following the POSIX standard.
      var mode = HEAP32[((varargs)>>2)];
      // Simplify flags.
      var accessMode = oflag & 3;
      var isWrite = accessMode != 0;
      var isRead = accessMode != 1;
      var isCreate = Boolean(oflag & 512);
      var isExistCheck = Boolean(oflag & 2048);
      var isTruncate = Boolean(oflag & 1024);
      var isAppend = Boolean(oflag & 8);
      // Verify path.
      var origPath = path;
      path = FS.analyzePath(Pointer_stringify(path));
      if (!path.parentExists) {
        ___setErrNo(path.error);
        return -1;
      }
      var target = path.object || null;
      var finalPath;
      // Verify the file exists, create if needed and allowed.
      if (target) {
        if (isCreate && isExistCheck) {
          ___setErrNo(ERRNO_CODES.EEXIST);
          return -1;
        }
        if ((isWrite || isTruncate) && target.isFolder) {
          ___setErrNo(ERRNO_CODES.EISDIR);
          return -1;
        }
        if (isRead && !target.read || isWrite && !target.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        if (isTruncate && !target.isDevice) {
          target.contents = [];
        } else {
          if (!FS.forceLoadFile(target)) {
            ___setErrNo(ERRNO_CODES.EIO);
            return -1;
          }
        }
        finalPath = path.path;
      } else {
        if (!isCreate) {
          ___setErrNo(ERRNO_CODES.ENOENT);
          return -1;
        }
        if (!path.parentObject.write) {
          ___setErrNo(ERRNO_CODES.EACCES);
          return -1;
        }
        target = FS.createDataFile(path.parentObject, path.name, [],
                                   mode & 0x100, mode & 0x80);  // S_IRUSR, S_IWUSR.
        finalPath = path.parentPath + '/' + path.name;
      }
      // Actually create an open stream.
      var id;
      if (target.isFolder) {
        var entryBuffer = 0;
        if (___dirent_struct_layout) {
          entryBuffer = _malloc(___dirent_struct_layout.__size__);
        }
        var contents = [];
        for (var key in target.contents) contents.push(key);
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          // An index into contents. Special values: -2 is ".", -1 is "..".
          position: -2,
          isRead: true,
          isWrite: false,
          isAppend: false,
          error: false,
          eof: false,
          ungotten: [],
          // Folder-specific properties:
          // Remember the contents at the time of opening in an array, so we can
          // seek between them relying on a single order.
          contents: contents,
          // Each stream has its own area for readdir() returns.
          currentEntry: entryBuffer
        });
      } else {
        id = FS.createFileHandle({
          path: finalPath,
          object: target,
          position: 0,
          isRead: isRead,
          isWrite: isWrite,
          isAppend: isAppend,
          error: false,
          eof: false,
          ungotten: []
        });
      }
      return id;
    }function _fopen(filename, mode) {
      // FILE *fopen(const char *restrict filename, const char *restrict mode);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fopen.html
      var flags;
      mode = Pointer_stringify(mode);
      if (mode[0] == 'r') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 0;
        }
      } else if (mode[0] == 'w') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 1024;
      } else if (mode[0] == 'a') {
        if (mode.indexOf('+') != -1) {
          flags = 2;
        } else {
          flags = 1;
        }
        flags |= 512;
        flags |= 8;
      } else {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return 0;
      }
      var ret = _open(filename, flags, allocate([0x1FF, 0, 0, 0], 'i32', ALLOC_STACK));  // All creation permissions.
      return (ret == -1) ? 0 : ret;
    }
  function _lseek(fildes, offset, whence) {
      // off_t lseek(int fildes, off_t offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/lseek.html
      if (FS.streams[fildes] && !FS.streams[fildes].object.isDevice) {
        var stream = FS.streams[fildes];
        var position = offset;
        if (whence === 1) {  // SEEK_CUR.
          position += stream.position;
        } else if (whence === 2) {  // SEEK_END.
          position += stream.object.contents.length;
        }
        if (position < 0) {
          ___setErrNo(ERRNO_CODES.EINVAL);
          return -1;
        } else {
          stream.ungotten = [];
          stream.position = position;
          return position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }function _fseek(stream, offset, whence) {
      // int fseek(FILE *stream, long offset, int whence);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fseek.html
      var ret = _lseek(stream, offset, whence);
      if (ret == -1) {
        return -1;
      } else {
        FS.streams[stream].eof = false;
        return 0;
      }
    }
  Module["_strcpy"] = _strcpy;
  Module["_memcpy"] = _memcpy;var _llvm_memcpy_p0i8_p0i8_i32=_memcpy;
  function _ftell(stream) {
      // long ftell(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/ftell.html
      if (FS.streams[stream]) {
        stream = FS.streams[stream];
        if (stream.object.isDevice) {
          ___setErrNo(ERRNO_CODES.ESPIPE);
          return -1;
        } else {
          return stream.position;
        }
      } else {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      }
    }
  function _recv(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      if (!info.hasData()) {
        ___setErrNo(ERRNO_CODES.EAGAIN); // no data, and all sockets are nonblocking, so this is the right behavior
        return -1;
      }
      var buffer = info.inQueue.shift();
      if (len < buffer.length) {
        if (info.stream) {
          // This is tcp (reliable), so if not all was read, keep it
          info.inQueue.unshift(buffer.subarray(len));
        }
        buffer = buffer.subarray(0, len);
      }
      HEAPU8.set(buffer, buf);
      return buffer.length;
    }
  function _pread(fildes, buf, nbyte, offset) {
      // ssize_t pread(int fildes, void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else if (offset >= stream.object.contents.length) {
        return 0;
      } else {
        var bytesRead = 0;
        var contents = stream.object.contents;
        var size = Math.min(contents.length - offset, nbyte);
        assert(size >= 0);
        if (contents.subarray) { // typed array
          HEAPU8.set(contents.subarray(offset, offset+size), buf);
        } else
        if (contents.slice) { // normal array
          for (var i = 0; i < size; i++) {
            HEAP8[(((buf)+(i))|0)]=contents[offset + i]
          }
        } else {
          for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
            HEAP8[(((buf)+(i))|0)]=contents.get(offset + i)
          }
        }
        bytesRead += size;
        return bytesRead;
      }
    }function _read(fildes, buf, nbyte) {
      // ssize_t read(int fildes, void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/read.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
        return _recv(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isRead) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var bytesRead;
        if (stream.object.isDevice) {
          if (stream.object.input) {
            bytesRead = 0;
            for (var i = 0; i < nbyte; i++) {
              try {
                var result = stream.object.input();
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
              if (result === undefined && bytesRead === 0) {
                ___setErrNo(ERRNO_CODES.EAGAIN);
                return -1;
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              HEAP8[(((buf)+(i))|0)]=result
            }
            return bytesRead;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          bytesRead = _pread(fildes, buf, nbyte, stream.position);
          assert(bytesRead >= -1);
          if (bytesRead != -1) {
            stream.position += bytesRead;
          }
          return bytesRead;
        }
      }
    }function _fread(ptr, size, nitems, stream) {
      // size_t fread(void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fread.html
      var bytesToRead = nitems * size;
      if (bytesToRead == 0) {
        return 0;
      }
      var bytesRead = 0;
      var streamObj = FS.streams[stream];
      while (streamObj.ungotten.length && bytesToRead > 0) {
        HEAP8[((ptr++)|0)]=streamObj.ungotten.pop()
        bytesToRead--;
        bytesRead++;
      }
      var err = _read(stream, ptr, bytesToRead);
      if (err == -1) {
        if (streamObj) streamObj.error = true;
        return 0;
      }
      bytesRead += err;
      if (bytesRead < bytesToRead) streamObj.eof = true;
      return Math.floor(bytesRead / size);
    }
  Module["_memset"] = _memset;var _llvm_memset_p0i8_i32=_memset;
  function _fgetc(stream) {
      // int fgetc(FILE *stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fgetc.html
      if (!FS.streams[stream]) return -1;
      var streamObj = FS.streams[stream];
      if (streamObj.eof || streamObj.error) return -1;
      var ret = _fread(_fgetc.ret, 1, 1, stream);
      if (ret == 0) {
        streamObj.eof = true;
        return -1;
      } else if (ret == -1) {
        streamObj.error = true;
        return -1;
      } else {
        return HEAPU8[((_fgetc.ret)|0)];
      }
    }
  function __reallyNegative(x) {
      return x < 0 || (x === 0 && (1/x) === -Infinity);
    }function __formatString(format, varargs) {
      var textIndex = format;
      var argIndex = 0;
      function getNextArg(type) {
        // NOTE: Explicitly ignoring type safety. Otherwise this fails:
        //       int x = 4; printf("%c\n", (char)x);
        var ret;
        if (type === 'double') {
          ret = HEAPF64[(((varargs)+(argIndex))>>3)];
        } else if (type == 'i64') {
          ret = [HEAP32[(((varargs)+(argIndex))>>2)],
                 HEAP32[(((varargs)+(argIndex+8))>>2)]];
          argIndex += 8; // each 32-bit chunk is in a 64-bit block
        } else {
          type = 'i32'; // varargs are always i32, i64, or double
          ret = HEAP32[(((varargs)+(argIndex))>>2)];
        }
        argIndex += Math.max(Runtime.getNativeFieldSize(type), Runtime.getAlignSize(type, null, true));
        return ret;
      }
      var ret = [];
      var curr, next, currArg;
      while(1) {
        var startTextIndex = textIndex;
        curr = HEAP8[(textIndex)];
        if (curr === 0) break;
        next = HEAP8[((textIndex+1)|0)];
        if (curr == 37) {
          // Handle flags.
          var flagAlwaysSigned = false;
          var flagLeftAlign = false;
          var flagAlternative = false;
          var flagZeroPad = false;
          flagsLoop: while (1) {
            switch (next) {
              case 43:
                flagAlwaysSigned = true;
                break;
              case 45:
                flagLeftAlign = true;
                break;
              case 35:
                flagAlternative = true;
                break;
              case 48:
                if (flagZeroPad) {
                  break flagsLoop;
                } else {
                  flagZeroPad = true;
                  break;
                }
              default:
                break flagsLoop;
            }
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          }
          // Handle width.
          var width = 0;
          if (next == 42) {
            width = getNextArg('i32');
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
          } else {
            while (next >= 48 && next <= 57) {
              width = width * 10 + (next - 48);
              textIndex++;
              next = HEAP8[((textIndex+1)|0)];
            }
          }
          // Handle precision.
          var precisionSet = false;
          if (next == 46) {
            var precision = 0;
            precisionSet = true;
            textIndex++;
            next = HEAP8[((textIndex+1)|0)];
            if (next == 42) {
              precision = getNextArg('i32');
              textIndex++;
            } else {
              while(1) {
                var precisionChr = HEAP8[((textIndex+1)|0)];
                if (precisionChr < 48 ||
                    precisionChr > 57) break;
                precision = precision * 10 + (precisionChr - 48);
                textIndex++;
              }
            }
            next = HEAP8[((textIndex+1)|0)];
          } else {
            var precision = 6; // Standard default.
          }
          // Handle integer sizes. WARNING: These assume a 32-bit architecture!
          var argSize;
          switch (String.fromCharCode(next)) {
            case 'h':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 104) {
                textIndex++;
                argSize = 1; // char (actually i32 in varargs)
              } else {
                argSize = 2; // short (actually i32 in varargs)
              }
              break;
            case 'l':
              var nextNext = HEAP8[((textIndex+2)|0)];
              if (nextNext == 108) {
                textIndex++;
                argSize = 8; // long long
              } else {
                argSize = 4; // long
              }
              break;
            case 'L': // long long
            case 'q': // int64_t
            case 'j': // intmax_t
              argSize = 8;
              break;
            case 'z': // size_t
            case 't': // ptrdiff_t
            case 'I': // signed ptrdiff_t or unsigned size_t
              argSize = 4;
              break;
            default:
              argSize = null;
          }
          if (argSize) textIndex++;
          next = HEAP8[((textIndex+1)|0)];
          // Handle type specifier.
          switch (String.fromCharCode(next)) {
            case 'd': case 'i': case 'u': case 'o': case 'x': case 'X': case 'p': {
              // Integer.
              var signed = next == 100 || next == 105;
              argSize = argSize || 4;
              var currArg = getNextArg('i' + (argSize * 8));
              var origArg = currArg;
              var argText;
              // Flatten i64-1 [low, high] into a (slightly rounded) double
              if (argSize == 8) {
                currArg = Runtime.makeBigInt(currArg[0], currArg[1], next == 117);
              }
              // Truncate to requested size.
              if (argSize <= 4) {
                var limit = Math.pow(256, argSize) - 1;
                currArg = (signed ? reSign : unSign)(currArg & limit, argSize * 8);
              }
              // Format the number.
              var currAbsArg = Math.abs(currArg);
              var prefix = '';
              if (next == 100 || next == 105) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], null); else
                argText = reSign(currArg, 8 * argSize, 1).toString(10);
              } else if (next == 117) {
                if (argSize == 8 && i64Math) argText = i64Math.stringify(origArg[0], origArg[1], true); else
                argText = unSign(currArg, 8 * argSize, 1).toString(10);
                currArg = Math.abs(currArg);
              } else if (next == 111) {
                argText = (flagAlternative ? '0' : '') + currAbsArg.toString(8);
              } else if (next == 120 || next == 88) {
                prefix = (flagAlternative && currArg != 0) ? '0x' : '';
                if (argSize == 8 && i64Math) {
                  if (origArg[1]) {
                    argText = (origArg[1]>>>0).toString(16);
                    var lower = (origArg[0]>>>0).toString(16);
                    while (lower.length < 8) lower = '0' + lower;
                    argText += lower;
                  } else {
                    argText = (origArg[0]>>>0).toString(16);
                  }
                } else
                if (currArg < 0) {
                  // Represent negative numbers in hex as 2's complement.
                  currArg = -currArg;
                  argText = (currAbsArg - 1).toString(16);
                  var buffer = [];
                  for (var i = 0; i < argText.length; i++) {
                    buffer.push((0xF - parseInt(argText[i], 16)).toString(16));
                  }
                  argText = buffer.join('');
                  while (argText.length < argSize * 2) argText = 'f' + argText;
                } else {
                  argText = currAbsArg.toString(16);
                }
                if (next == 88) {
                  prefix = prefix.toUpperCase();
                  argText = argText.toUpperCase();
                }
              } else if (next == 112) {
                if (currAbsArg === 0) {
                  argText = '(nil)';
                } else {
                  prefix = '0x';
                  argText = currAbsArg.toString(16);
                }
              }
              if (precisionSet) {
                while (argText.length < precision) {
                  argText = '0' + argText;
                }
              }
              // Add sign if needed
              if (flagAlwaysSigned) {
                if (currArg < 0) {
                  prefix = '-' + prefix;
                } else {
                  prefix = '+' + prefix;
                }
              }
              // Add padding.
              while (prefix.length + argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad) {
                    argText = '0' + argText;
                  } else {
                    prefix = ' ' + prefix;
                  }
                }
              }
              // Insert the result into the buffer.
              argText = prefix + argText;
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': {
              // Float.
              var currArg = getNextArg('double');
              var argText;
              if (isNaN(currArg)) {
                argText = 'nan';
                flagZeroPad = false;
              } else if (!isFinite(currArg)) {
                argText = (currArg < 0 ? '-' : '') + 'inf';
                flagZeroPad = false;
              } else {
                var isGeneral = false;
                var effectivePrecision = Math.min(precision, 20);
                // Convert g/G to f/F or e/E, as per:
                // http://pubs.opengroup.org/onlinepubs/9699919799/functions/printf.html
                if (next == 103 || next == 71) {
                  isGeneral = true;
                  precision = precision || 1;
                  var exponent = parseInt(currArg.toExponential(effectivePrecision).split('e')[1], 10);
                  if (precision > exponent && exponent >= -4) {
                    next = ((next == 103) ? 'f' : 'F').charCodeAt(0);
                    precision -= exponent + 1;
                  } else {
                    next = ((next == 103) ? 'e' : 'E').charCodeAt(0);
                    precision--;
                  }
                  effectivePrecision = Math.min(precision, 20);
                }
                if (next == 101 || next == 69) {
                  argText = currArg.toExponential(effectivePrecision);
                  // Make sure the exponent has at least 2 digits.
                  if (/[eE][-+]\d$/.test(argText)) {
                    argText = argText.slice(0, -1) + '0' + argText.slice(-1);
                  }
                } else if (next == 102 || next == 70) {
                  argText = currArg.toFixed(effectivePrecision);
                  if (currArg === 0 && __reallyNegative(currArg)) {
                    argText = '-' + argText;
                  }
                }
                var parts = argText.split('e');
                if (isGeneral && !flagAlternative) {
                  // Discard trailing zeros and periods.
                  while (parts[0].length > 1 && parts[0].indexOf('.') != -1 &&
                         (parts[0].slice(-1) == '0' || parts[0].slice(-1) == '.')) {
                    parts[0] = parts[0].slice(0, -1);
                  }
                } else {
                  // Make sure we have a period in alternative mode.
                  if (flagAlternative && argText.indexOf('.') == -1) parts[0] += '.';
                  // Zero pad until required precision.
                  while (precision > effectivePrecision++) parts[0] += '0';
                }
                argText = parts[0] + (parts.length > 1 ? 'e' + parts[1] : '');
                // Capitalize 'E' if needed.
                if (next == 69) argText = argText.toUpperCase();
                // Add sign.
                if (flagAlwaysSigned && currArg >= 0) {
                  argText = '+' + argText;
                }
              }
              // Add padding.
              while (argText.length < width) {
                if (flagLeftAlign) {
                  argText += ' ';
                } else {
                  if (flagZeroPad && (argText[0] == '-' || argText[0] == '+')) {
                    argText = argText[0] + '0' + argText.slice(1);
                  } else {
                    argText = (flagZeroPad ? '0' : ' ') + argText;
                  }
                }
              }
              // Adjust case.
              if (next < 97) argText = argText.toUpperCase();
              // Insert the result into the buffer.
              argText.split('').forEach(function(chr) {
                ret.push(chr.charCodeAt(0));
              });
              break;
            }
            case 's': {
              // String.
              var arg = getNextArg('i8*');
              var argLength = arg ? _strlen(arg) : '(null)'.length;
              if (precisionSet) argLength = Math.min(argLength, precision);
              if (!flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              if (arg) {
                for (var i = 0; i < argLength; i++) {
                  ret.push(HEAPU8[((arg++)|0)]);
                }
              } else {
                ret = ret.concat(intArrayFromString('(null)'.substr(0, argLength), true));
              }
              if (flagLeftAlign) {
                while (argLength < width--) {
                  ret.push(32);
                }
              }
              break;
            }
            case 'c': {
              // Character.
              if (flagLeftAlign) ret.push(getNextArg('i8'));
              while (--width > 0) {
                ret.push(32);
              }
              if (!flagLeftAlign) ret.push(getNextArg('i8'));
              break;
            }
            case 'n': {
              // Write the length written so far to the next parameter.
              var ptr = getNextArg('i32*');
              HEAP32[((ptr)>>2)]=ret.length
              break;
            }
            case '%': {
              // Literal percent sign.
              ret.push(curr);
              break;
            }
            default: {
              // Unknown specifiers remain untouched.
              for (var i = startTextIndex; i < textIndex + 2; i++) {
                ret.push(HEAP8[(i)]);
              }
            }
          }
          textIndex += 2;
          // TODO: Support a/A (hex float) and m (last error) specifiers.
          // TODO: Support %1${specifier} for arg selection.
        } else {
          ret.push(curr);
          textIndex += 1;
        }
      }
      return ret;
    }function _snprintf(s, n, format, varargs) {
      // int snprintf(char *restrict s, size_t n, const char *restrict format, ...);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/printf.html
      var result = __formatString(format, varargs);
      var limit = (n === undefined) ? result.length
                                    : Math.min(result.length, Math.max(n - 1, 0));
      if (s < 0) {
        s = -s;
        var buf = _malloc(limit+1);
        HEAP32[((s)>>2)]=buf;
        s = buf;
      }
      for (var i = 0; i < limit; i++) {
        HEAP8[(((s)+(i))|0)]=result[i];
      }
      if (limit < n || (n === undefined)) HEAP8[(((s)+(i))|0)]=0;
      return result.length;
    }
  Module["_strncpy"] = _strncpy;
  function _strchr(ptr, chr) {
      ptr--;
      do {
        ptr++;
        var val = HEAP8[(ptr)];
        if (val == chr) return ptr;
      } while (val);
      return 0;
    }
  Module["_tolower"] = _tolower; 
  Module["_strncasecmp"] = _strncasecmp; 
  Module["_strcasecmp"] = _strcasecmp;
  function _send(fd, buf, len, flags) {
      var info = FS.streams[fd];
      if (!info) return -1;
      info.sender(HEAPU8.subarray(buf, buf+len));
      return len;
    }
  function _pwrite(fildes, buf, nbyte, offset) {
      // ssize_t pwrite(int fildes, const void *buf, size_t nbyte, off_t offset);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (!stream || stream.object.isDevice) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (stream.object.isFolder) {
        ___setErrNo(ERRNO_CODES.EISDIR);
        return -1;
      } else if (nbyte < 0 || offset < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        var contents = stream.object.contents;
        while (contents.length < offset) contents.push(0);
        for (var i = 0; i < nbyte; i++) {
          contents[offset + i] = HEAPU8[(((buf)+(i))|0)];
        }
        stream.object.timestamp = Date.now();
        return i;
      }
    }function _write(fildes, buf, nbyte) {
      // ssize_t write(int fildes, const void *buf, size_t nbyte);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/write.html
      var stream = FS.streams[fildes];
      if (stream && ('socket' in stream)) {
          return _send(fildes, buf, nbyte, 0);
      } else if (!stream) {
        ___setErrNo(ERRNO_CODES.EBADF);
        return -1;
      } else if (!stream.isWrite) {
        ___setErrNo(ERRNO_CODES.EACCES);
        return -1;
      } else if (nbyte < 0) {
        ___setErrNo(ERRNO_CODES.EINVAL);
        return -1;
      } else {
        if (stream.object.isDevice) {
          if (stream.object.output) {
            for (var i = 0; i < nbyte; i++) {
              try {
                stream.object.output(HEAP8[(((buf)+(i))|0)]);
              } catch (e) {
                ___setErrNo(ERRNO_CODES.EIO);
                return -1;
              }
            }
            stream.object.timestamp = Date.now();
            return i;
          } else {
            ___setErrNo(ERRNO_CODES.ENXIO);
            return -1;
          }
        } else {
          var bytesWritten = _pwrite(fildes, buf, nbyte, stream.position);
          if (bytesWritten != -1) stream.position += bytesWritten;
          return bytesWritten;
        }
      }
    }function _fwrite(ptr, size, nitems, stream) {
      // size_t fwrite(const void *restrict ptr, size_t size, size_t nitems, FILE *restrict stream);
      // http://pubs.opengroup.org/onlinepubs/000095399/functions/fwrite.html
      var bytesToWrite = nitems * size;
      if (bytesToWrite == 0) return 0;
      var bytesWritten = _write(stream, ptr, bytesToWrite);
      if (bytesWritten == -1) {
        if (FS.streams[stream]) FS.streams[stream].error = true;
        return 0;
      } else {
        return Math.floor(bytesWritten / size);
      }
    }
  var _llvm_memset_p0i8_i64=_memset;
  function _abort() {
      Module['abort']();
    }
  function ___errno_location() {
      return ___errno_state;
    }var ___errno=___errno_location;
  function _sysconf(name) {
      // long sysconf(int name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/sysconf.html
      switch(name) {
        case 8: return PAGE_SIZE;
        case 54:
        case 56:
        case 21:
        case 61:
        case 63:
        case 22:
        case 67:
        case 23:
        case 24:
        case 25:
        case 26:
        case 27:
        case 69:
        case 28:
        case 101:
        case 70:
        case 71:
        case 29:
        case 30:
        case 199:
        case 75:
        case 76:
        case 32:
        case 43:
        case 44:
        case 80:
        case 46:
        case 47:
        case 45:
        case 48:
        case 49:
        case 42:
        case 82:
        case 33:
        case 7:
        case 108:
        case 109:
        case 107:
        case 112:
        case 119:
        case 121:
          return 200809;
        case 13:
        case 104:
        case 94:
        case 95:
        case 34:
        case 35:
        case 77:
        case 81:
        case 83:
        case 84:
        case 85:
        case 86:
        case 87:
        case 88:
        case 89:
        case 90:
        case 91:
        case 94:
        case 95:
        case 110:
        case 111:
        case 113:
        case 114:
        case 115:
        case 116:
        case 117:
        case 118:
        case 120:
        case 40:
        case 16:
        case 79:
        case 19:
          return -1;
        case 92:
        case 93:
        case 5:
        case 72:
        case 6:
        case 74:
        case 92:
        case 93:
        case 96:
        case 97:
        case 98:
        case 99:
        case 102:
        case 103:
        case 105:
          return 1;
        case 38:
        case 66:
        case 50:
        case 51:
        case 4:
          return 1024;
        case 15:
        case 64:
        case 41:
          return 32;
        case 55:
        case 37:
        case 17:
          return 2147483647;
        case 18:
        case 1:
          return 47839;
        case 59:
        case 57:
          return 99;
        case 68:
        case 58:
          return 2048;
        case 0: return 2097152;
        case 3: return 65536;
        case 14: return 32768;
        case 73: return 32767;
        case 39: return 16384;
        case 60: return 1000;
        case 106: return 700;
        case 52: return 256;
        case 62: return 255;
        case 2: return 100;
        case 65: return 64;
        case 36: return 20;
        case 100: return 16;
        case 20: return 6;
        case 53: return 4;
        case 10: return 1;
      }
      ___setErrNo(ERRNO_CODES.EINVAL);
      return -1;
    }
  function _time(ptr) {
      var ret = Math.floor(Date.now()/1000);
      if (ptr) {
        HEAP32[((ptr)>>2)]=ret
      }
      return ret;
    }
  function _sbrk(bytes) {
      // Implement a Linux-like 'memory area' for our 'process'.
      // Changes the size of the memory area by |bytes|; returns the
      // address of the previous top ('break') of the memory area
      // We control the "dynamic" memory - DYNAMIC_BASE to DYNAMICTOP
      var self = _sbrk;
      if (!self.called) {
        DYNAMICTOP = alignMemoryPage(DYNAMICTOP); // make sure we start out aligned
        self.called = true;
        assert(Runtime.dynamicAlloc);
        self.alloc = Runtime.dynamicAlloc;
        Runtime.dynamicAlloc = function() { abort('cannot dynamically allocate, sbrk now has control') };
      }
      var ret = DYNAMICTOP;
      if (bytes != 0) self.alloc(bytes);
      return ret;  // Previous break location.
    }
  var Browser={mainLoop:{scheduler:null,shouldPause:false,paused:false,queue:[],pause:function () {
          Browser.mainLoop.shouldPause = true;
        },resume:function () {
          if (Browser.mainLoop.paused) {
            Browser.mainLoop.paused = false;
            Browser.mainLoop.scheduler();
          }
          Browser.mainLoop.shouldPause = false;
        },updateStatus:function () {
          if (Module['setStatus']) {
            var message = Module['statusMessage'] || 'Please wait...';
            var remaining = Browser.mainLoop.remainingBlockers;
            var expected = Browser.mainLoop.expectedBlockers;
            if (remaining) {
              if (remaining < expected) {
                Module['setStatus'](message + ' (' + (expected - remaining) + '/' + expected + ')');
              } else {
                Module['setStatus'](message);
              }
            } else {
              Module['setStatus']('');
            }
          }
        }},isFullScreen:false,pointerLock:false,moduleContextCreatedCallbacks:[],workers:[],init:function () {
        if (!Module["preloadPlugins"]) Module["preloadPlugins"] = []; // needs to exist even in workers
        if (Browser.initted || ENVIRONMENT_IS_WORKER) return;
        Browser.initted = true;
        try {
          new Blob();
          Browser.hasBlobConstructor = true;
        } catch(e) {
          Browser.hasBlobConstructor = false;
          console.log("warning: no blob constructor, cannot create blobs with mimetypes");
        }
        Browser.BlobBuilder = typeof MozBlobBuilder != "undefined" ? MozBlobBuilder : (typeof WebKitBlobBuilder != "undefined" ? WebKitBlobBuilder : (!Browser.hasBlobConstructor ? console.log("warning: no BlobBuilder") : null));
        Browser.URLObject = typeof window != "undefined" ? (window.URL ? window.URL : window.webkitURL) : console.log("warning: cannot create object URLs");
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to Module.preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
        var imagePlugin = {};
        imagePlugin['canHandle'] = function(name) {
          return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
        };
        imagePlugin['handle'] = function(byteArray, name, onload, onerror) {
          var b = null;
          if (Browser.hasBlobConstructor) {
            try {
              b = new Blob([byteArray], { type: Browser.getMimetype(name) });
              if (b.size !== byteArray.length) { // Safari bug #118630
                // Safari's Blob can only take an ArrayBuffer
                b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
              }
            } catch(e) {
              Runtime.warnOnce('Blob constructor present but fails: ' + e + '; falling back to blob builder');
            }
          }
          if (!b) {
            var bb = new Browser.BlobBuilder();
            bb.append((new Uint8Array(byteArray)).buffer); // we need to pass a buffer, and must copy the array to get the right data range
            b = bb.getBlob();
          }
          var url = Browser.URLObject.createObjectURL(b);
          var img = new Image();
          img.onload = function() {
            assert(img.complete, 'Image ' + name + ' could not be decoded');
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Module["preloadedImages"][name] = canvas;
            Browser.URLObject.revokeObjectURL(url);
            if (onload) onload(byteArray);
          };
          img.onerror = function(event) {
            console.log('Image ' + url + ' could not be decoded');
            if (onerror) onerror();
          };
          img.src = url;
        };
        Module['preloadPlugins'].push(imagePlugin);
        var audioPlugin = {};
        audioPlugin['canHandle'] = function(name) {
          return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = audio;
            if (onload) onload(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Module["preloadedAudios"][name] = new Audio(); // empty shim
            if (onerror) onerror();
          }
          if (Browser.hasBlobConstructor) {
            try {
              var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
            } catch(e) {
              return fail();
            }
            var url = Browser.URLObject.createObjectURL(b); // XXX we never revoke this!
            var audio = new Audio();
            audio.addEventListener('canplaythrough', function() { finish(audio) }, false); // use addEventListener due to chromium bug 124926
            audio.onerror = function(event) {
              if (done) return;
              console.log('warning: browser could not fully decode audio ' + name + ', trying slower base64 approach');
              function encode64(data) {
                var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                var PAD = '=';
                var ret = '';
                var leftchar = 0;
                var leftbits = 0;
                for (var i = 0; i < data.length; i++) {
                  leftchar = (leftchar << 8) | data[i];
                  leftbits += 8;
                  while (leftbits >= 6) {
                    var curr = (leftchar >> (leftbits-6)) & 0x3f;
                    leftbits -= 6;
                    ret += BASE[curr];
                  }
                }
                if (leftbits == 2) {
                  ret += BASE[(leftchar&3) << 4];
                  ret += PAD + PAD;
                } else if (leftbits == 4) {
                  ret += BASE[(leftchar&0xf) << 2];
                  ret += PAD;
                }
                return ret;
              }
              audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
              finish(audio); // we don't wait for confirmation this worked - but it's worth trying
            };
            audio.src = url;
            // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
            Browser.safeSetTimeout(function() {
              finish(audio); // try to use it even though it is not necessarily ready to play
            }, 10000);
          } else {
            return fail();
          }
        };
        Module['preloadPlugins'].push(audioPlugin);
        // Canvas event setup
        var canvas = Module['canvas'];
        canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                    canvas['mozRequestPointerLock'] ||
                                    canvas['webkitRequestPointerLock'];
        canvas.exitPointerLock = document['exitPointerLock'] ||
                                 document['mozExitPointerLock'] ||
                                 document['webkitExitPointerLock'] ||
                                 function(){}; // no-op if function does not exist
        canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
        function pointerLockChange() {
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas;
        }
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('mozpointerlockchange', pointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
        if (Module['elementPointerLock']) {
          canvas.addEventListener("click", function(ev) {
            if (!Browser.pointerLock && canvas.requestPointerLock) {
              canvas.requestPointerLock();
              ev.preventDefault();
            }
          }, false);
        }
      },createContext:function (canvas, useWebGL, setInModule) {
        var ctx;
        try {
          if (useWebGL) {
            ctx = canvas.getContext('experimental-webgl', {
              alpha: false
            });
          } else {
            ctx = canvas.getContext('2d');
          }
          if (!ctx) throw ':(';
        } catch (e) {
          Module.print('Could not create canvas - ' + e);
          return null;
        }
        if (useWebGL) {
          // Set the background of the WebGL canvas to black
          canvas.style.backgroundColor = "black";
          // Warn on context loss
          canvas.addEventListener('webglcontextlost', function(event) {
            alert('WebGL context lost. You will need to reload the page.');
          }, false);
        }
        if (setInModule) {
          Module.ctx = ctx;
          Module.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach(function(callback) { callback() });
          Browser.init();
        }
        return ctx;
      },destroyContext:function (canvas, useWebGL, setInModule) {},fullScreenHandlersInstalled:false,lockPointer:undefined,resizeCanvas:undefined,requestFullScreen:function (lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer === 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas === 'undefined') Browser.resizeCanvas = false;
        var canvas = Module['canvas'];
        function fullScreenChange() {
          Browser.isFullScreen = false;
          if ((document['webkitFullScreenElement'] || document['webkitFullscreenElement'] ||
               document['mozFullScreenElement'] || document['mozFullscreenElement'] ||
               document['fullScreenElement'] || document['fullscreenElement']) === canvas) {
            canvas.cancelFullScreen = document['cancelFullScreen'] ||
                                      document['mozCancelFullScreen'] ||
                                      document['webkitCancelFullScreen'];
            canvas.cancelFullScreen = canvas.cancelFullScreen.bind(document);
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullScreen = true;
            if (Browser.resizeCanvas) Browser.setFullScreenCanvasSize();
          } else if (Browser.resizeCanvas){
            Browser.setWindowedCanvasSize();
          }
          if (Module['onFullScreen']) Module['onFullScreen'](Browser.isFullScreen);
        }
        if (!Browser.fullScreenHandlersInstalled) {
          Browser.fullScreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullScreenChange, false);
          document.addEventListener('mozfullscreenchange', fullScreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullScreenChange, false);
        }
        canvas.requestFullScreen = canvas['requestFullScreen'] ||
                                   canvas['mozRequestFullScreen'] ||
                                   (canvas['webkitRequestFullScreen'] ? function() { canvas['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) } : null);
        canvas.requestFullScreen();
      },requestAnimationFrame:function (func) {
        if (!window.requestAnimationFrame) {
          window.requestAnimationFrame = window['requestAnimationFrame'] ||
                                         window['mozRequestAnimationFrame'] ||
                                         window['webkitRequestAnimationFrame'] ||
                                         window['msRequestAnimationFrame'] ||
                                         window['oRequestAnimationFrame'] ||
                                         window['setTimeout'];
        }
        window.requestAnimationFrame(func);
      },safeCallback:function (func) {
        return function() {
          if (!ABORT) return func.apply(null, arguments);
        };
      },safeRequestAnimationFrame:function (func) {
        return Browser.requestAnimationFrame(function() {
          if (!ABORT) func();
        });
      },safeSetTimeout:function (func, timeout) {
        return setTimeout(function() {
          if (!ABORT) func();
        }, timeout);
      },safeSetInterval:function (func, timeout) {
        return setInterval(function() {
          if (!ABORT) func();
        }, timeout);
      },getMimetype:function (name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.substr(name.lastIndexOf('.')+1)];
      },getUserMedia:function (func) {
        if(!window.getUserMedia) {
          window.getUserMedia = navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        }
        window.getUserMedia(func);
      },getMovementX:function (event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },getMovementY:function (event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },mouseX:0,mouseY:0,mouseMovementX:0,mouseMovementY:0,calculateMouseEvent:function (event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
          // check if SDL is available
          if (typeof SDL != "undefined") {
          	Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
          	Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
          } else {
          	// just add the mouse delta to the current absolut mouse position
          	// FIXME: ideally this should be clamped against the canvas size and zero
          	Browser.mouseX += Browser.mouseMovementX;
          	Browser.mouseY += Browser.mouseMovementY;
          }        
        } else {
          // Otherwise, calculate the movement based on the changes
          // in the coordinates.
          var rect = Module["canvas"].getBoundingClientRect();
          var x = event.pageX - (window.scrollX + rect.left);
          var y = event.pageY - (window.scrollY + rect.top);
          // the canvas might be CSS-scaled compared to its backbuffer;
          // SDL-using content will want mouse coordinates in terms
          // of backbuffer units.
          var cw = Module["canvas"].width;
          var ch = Module["canvas"].height;
          x = x * (cw / rect.width);
          y = y * (ch / rect.height);
          Browser.mouseMovementX = x - Browser.mouseX;
          Browser.mouseMovementY = y - Browser.mouseY;
          Browser.mouseX = x;
          Browser.mouseY = y;
        }
      },xhrLoad:function (url, onload, onerror) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            onload(xhr.response);
          } else {
            onerror();
          }
        };
        xhr.onerror = onerror;
        xhr.send(null);
      },asyncLoad:function (url, onload, onerror, noRunDep) {
        Browser.xhrLoad(url, function(arrayBuffer) {
          assert(arrayBuffer, 'Loading data file "' + url + '" failed (no arrayBuffer).');
          onload(new Uint8Array(arrayBuffer));
          if (!noRunDep) removeRunDependency('al ' + url);
        }, function(event) {
          if (onerror) {
            onerror();
          } else {
            throw 'Loading data file "' + url + '" failed.';
          }
        });
        if (!noRunDep) addRunDependency('al ' + url);
      },resizeListeners:[],updateResizeListeners:function () {
        var canvas = Module['canvas'];
        Browser.resizeListeners.forEach(function(listener) {
          listener(canvas.width, canvas.height);
        });
      },setCanvasSize:function (width, height, noUpdates) {
        var canvas = Module['canvas'];
        canvas.width = width;
        canvas.height = height;
        if (!noUpdates) Browser.updateResizeListeners();
      },windowedWidth:0,windowedHeight:0,setFullScreenCanvasSize:function () {
        var canvas = Module['canvas'];
        this.windowedWidth = canvas.width;
        this.windowedHeight = canvas.height;
        canvas.width = screen.width;
        canvas.height = screen.height;
        // check if SDL is available   
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      },setWindowedCanvasSize:function () {
        var canvas = Module['canvas'];
        canvas.width = this.windowedWidth;
        canvas.height = this.windowedHeight;
        // check if SDL is available       
        if (typeof SDL != "undefined") {
        	var flags = HEAPU32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)];
        	flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
        	HEAP32[((SDL.screen+Runtime.QUANTUM_SIZE*0)>>2)]=flags
        }
        Browser.updateResizeListeners();
      }};
FS.staticInit();__ATINIT__.unshift({ func: function() { if (!Module["noFSInit"] && !FS.init.initialized) FS.init() } });__ATMAIN__.push({ func: function() { FS.ignorePermissions = false } });__ATEXIT__.push({ func: function() { FS.quit() } });Module["FS_createFolder"] = FS.createFolder;Module["FS_createPath"] = FS.createPath;Module["FS_createDataFile"] = FS.createDataFile;Module["FS_createPreloadedFile"] = FS.createPreloadedFile;Module["FS_createLazyFile"] = FS.createLazyFile;Module["FS_createLink"] = FS.createLink;Module["FS_createDevice"] = FS.createDevice;
___errno_state = Runtime.staticAlloc(4); HEAP32[((___errno_state)>>2)]=0;
_fgetc.ret = allocate([0], "i8", ALLOC_STATIC);
Module["requestFullScreen"] = function(lockPointer, resizeCanvas) { Browser.requestFullScreen(lockPointer, resizeCanvas) };
  Module["requestAnimationFrame"] = function(func) { Browser.requestAnimationFrame(func) };
  Module["pauseMainLoop"] = function() { Browser.mainLoop.pause() };
  Module["resumeMainLoop"] = function() { Browser.mainLoop.resume() };
  Module["getUserMedia"] = function() { Browser.getUserMedia() }
STACK_BASE = STACKTOP = Runtime.alignMemory(STATICTOP);
staticSealed = true; // seal the static portion of memory
STACK_MAX = STACK_BASE + 5242880;
DYNAMIC_BASE = DYNAMICTOP = Runtime.alignMemory(STACK_MAX);
assert(DYNAMIC_BASE < TOTAL_MEMORY); // Stack must fit in TOTAL_MEMORY; allocations from here on may enlarge TOTAL_MEMORY
var Math_min = Math.min;
function invoke_ii(index,a1) {
  try {
    return Module["dynCall_ii"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_v(index) {
  try {
    Module["dynCall_v"](index);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_iii(index,a1,a2) {
  try {
    return Module["dynCall_iii"](index,a1,a2);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function invoke_vi(index,a1) {
  try {
    Module["dynCall_vi"](index,a1);
  } catch(e) {
    if (typeof e !== 'number' && e !== 'longjmp') throw e;
    asm["setThrew"](1, 0);
  }
}
function asmPrintInt(x, y) {
  Module.print('int ' + x + ',' + y);// + ' ' + new Error().stack);
}
function asmPrintFloat(x, y) {
  Module.print('float ' + x + ',' + y);// + ' ' + new Error().stack);
}
// EMSCRIPTEN_START_ASM
var asm=(function(global,env,buffer){"use asm";var a=new global.Int8Array(buffer);var b=new global.Int16Array(buffer);var c=new global.Int32Array(buffer);var d=new global.Uint8Array(buffer);var e=new global.Uint16Array(buffer);var f=new global.Uint32Array(buffer);var g=new global.Float32Array(buffer);var h=new global.Float64Array(buffer);var i=env.STACKTOP|0;var j=env.STACK_MAX|0;var k=env.tempDoublePtr|0;var l=env.ABORT|0;var m=env._stderr|0;var n=+env.NaN;var o=+env.Infinity;var p=0;var q=0;var r=0;var s=0;var t=0,u=0,v=0,w=0,x=0.0,y=0,z=0,A=0,B=0.0;var C=0;var D=0;var E=0;var F=0;var G=0;var H=0;var I=0;var J=0;var K=0;var L=0;var M=global.Math.floor;var N=global.Math.abs;var O=global.Math.sqrt;var P=global.Math.pow;var Q=global.Math.cos;var R=global.Math.sin;var S=global.Math.tan;var T=global.Math.acos;var U=global.Math.asin;var V=global.Math.atan;var W=global.Math.atan2;var X=global.Math.exp;var Y=global.Math.log;var Z=global.Math.ceil;var _=global.Math.imul;var $=env.abort;var aa=env.assert;var ab=env.asmPrintInt;var ac=env.asmPrintFloat;var ad=env.min;var ae=env.invoke_ii;var af=env.invoke_v;var ag=env.invoke_iii;var ah=env.invoke_vi;var ai=env._lseek;var aj=env._snprintf;var ak=env._fgetc;var al=env._fread;var am=env._fclose;var an=env._abort;var ao=env._close;var ap=env._pread;var aq=env._fopen;var ar=env._open;var as=env._strchr;var at=env._sysconf;var au=env.___setErrNo;var av=env.__reallyNegative;var aw=env._fseek;var ax=env._send;var ay=env._write;var az=env._ftell;var aA=env._strdup;var aB=env._read;var aC=env._time;var aD=env.__formatString;var aE=env._recv;var aF=env._pwrite;var aG=env._sbrk;var aH=env._fsync;var aI=env.___errno_location;var aJ=env._fwrite;
// EMSCRIPTEN_START_FUNCS
function aO(a){a=a|0;var b=0;b=i;i=i+a|0;i=i+7>>3<<3;return b|0}function aP(){return i|0}function aQ(a){a=a|0;i=a}function aR(a,b){a=a|0;b=b|0;if((p|0)==0){p=a;q=b}}function aS(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0]}function aT(b){b=b|0;a[k]=a[b];a[k+1|0]=a[b+1|0];a[k+2|0]=a[b+2|0];a[k+3|0]=a[b+3|0];a[k+4|0]=a[b+4|0];a[k+5|0]=a[b+5|0];a[k+6|0]=a[b+6|0];a[k+7|0]=a[b+7|0]}function aU(a){a=a|0;C=a}function aV(a){a=a|0;D=a}function aW(a){a=a|0;E=a}function aX(a){a=a|0;F=a}function aY(a){a=a|0;G=a}function aZ(a){a=a|0;H=a}function a_(a){a=a|0;I=a}function a$(a){a=a|0;J=a}function a0(a){a=a|0;K=a}function a1(a){a=a|0;L=a}function a2(){}function a3(a,b,d,e,f){a=a|0;b=b|0;d=d|0;e=e|0;f=f|0;var g=0,h=0,i=0,j=0,k=0,l=0;g=0;do{h=g>>>1;i=(g&1|0)!=0?h^-306674912:h;h=i>>>1;j=(i&1|0)!=0?h^-306674912:h;h=j>>>1;i=(j&1|0)!=0?h^-306674912:h;h=i>>>1;j=(i&1|0)!=0?h^-306674912:h;h=j>>>1;i=(j&1|0)!=0?h^-306674912:h;h=i>>>1;j=(i&1|0)!=0?h^-306674912:h;h=j>>>1;i=(j&1|0)!=0?h^-306674912:h;h=i>>>1;c[17704+(g<<2)>>2]=(i&1|0)!=0?h^-306674912:h;g=g+1|0;}while((g|0)<256);g=c[4832]|0;if((g|0)!=0){bk(g)}c[4832]=aA(d|0)|0;d=c[4834]|0;if((d|0)!=0){bk(d)}c[4834]=aA(e|0)|0;e=c[732]|0;if((e|0)!=0){bk(e)}if((f|0)==0){k=aA(832)|0}else{k=aA(f|0)|0}c[732]=k;c[192]=0;c[190]=b;k=a4()|0;f=c[732]|0;if((f|0)!=0){bk(f)}c[732]=aA(832)|0;f=c[202]|0;if((f|0)!=0){am(f|0)|0;c[202]=0}f=c[592]|0;if((f|0)!=0){bk(f)}f=c[600]|0;if((f|0)!=0){bk(f)}f=c[4422]|0;if((f|0)!=0){bk(f)}c[592]=0;c[600]=0;c[4422]=0;f=k&1;if(k){l=c[192]|0;c[a>>2]=l;return f|0}k=c[192]|0;if((k|0)!=0){bk(k)}c[192]=0;c[a>>2]=0;c[b>>2]=0;l=c[192]|0;c[a>>2]=l;return f|0}function a4(){var e=0,f=0,g=0,h=0,j=0,k=0,l=0,n=0,o=0,p=0,q=0,r=0,s=0,u=0,v=0,w=0;e=i;i=i+64|0;f=e|0;a[17280]=0;g=aq(c[4834]|0,160)|0;c[202]=g;if((g|0)==0){h=0;i=e;return h|0}do{if((al(800,1,7,g|0)|0)==7){j=(t=d[800]|d[801|0]<<8,t<<16>>16)<<16>>16==24914&(a[802]|0)==114;k=j&(t=d[803]|d[804|0]<<8,t<<16>>16)<<16>>16==6689;if(!(k&(t=d[805]|d[806|0]<<8,t<<16>>16)<<16>>16==7)){k=c[m>>2]|0;aJ(40,114,1,k|0)|0;break}if((a8(115)|0)!=13){break}k=bj(1048576)|0;c[592]=k;if((k|0)==0){h=0;i=e;return h|0}k=c[202]|0;j=((t=d[821]|d[822|0]<<8,t<<16>>16)&65535)-13|0;aw(k|0,j|0,1)|0;L52:while(1){j=(a6(32884)|0)<1;if(j|(a[18730]|0)==119){l=0;break}j=(a9(c[4832]|0,c[4836]|0)|0)==0;a[17280]=j&1;if(j){c[192]=bj(c[755]|0)|0;c[c[190]>>2]=0;if((c[192]|0)==0){l=0;break}}if(((t=d[819]|d[820|0]<<8,t<<16>>16)&8)==0){if((a[17280]&1)!=0){n=42}}else{n=42}do{if((n|0)==42){n=0;o=a[3036]|0;if((o-13&255)>16){n=43;break L52}c[4414]=0;c[4416]=0;j=c[732]|0;do{if((a[j]|0)==0){n=46}else{if((b[1506]&4)==0){n=46;break}c[4322]=o&255;if(o<<24>>24==0){break}ba(j)}}while(0);if((n|0)==46){n=0;c[4322]=0}j=c[754]|0;c[332]=j;k=c[755]|0;c[4326]=k;do{if((a[3037]|0)==48){p=c[192]|0;do{if((k|0)==0){q=0;n=53}else{r=c[202]|0;if((r|0)==0){s=0;break}u=al(p|0,1,(j>>>0<k>>>0?j:k)|0,r|0)|0;c[4416]=(c[4416]|0)+u;c[332]=(c[332]|0)-u;q=u;n=53}}while(0);do{if((n|0)==53){n=0;if((q|0)==-1|(c[4322]|0)<20){s=q;break}if((q|0)==0){s=0;break}else{v=0}while(1){bg(p+v|0);u=v+16|0;if(u>>>0<q>>>0){v=u}else{s=q;break}}}}while(0);c[c[190]>>2]=s}else{if((a[3036]|0)==29){break}bb(c[592]|0)}}while(0);k=c[192]|0;if((k|0)==0){break}j=c[757]|0;p=c[755]|0;if((p|0)==0){w=0}else{u=-1;r=0;do{u=c[17704+((d[k+r|0]^u&255)<<2)>>2]^u>>>8;r=r+1|0;}while(r>>>0<p>>>0);w=~u}if((j|0)!=(w|0)){l=0;break L52}}}while(0);p=c[202]|0;if((p|0)!=0){r=c[750]|0;aw(p|0,r|0,0)|0}if((a9(c[4832]|0,c[4836]|0)|0)==0){l=1;break}}if((n|0)==43){r=f|0;p=o&255;aj(r|0,64,8,(t=i,i=i+8|0,c[t>>2]=p,t)|0)|0;l=0}bk(c[592]|0);c[592]=0;p=c[202]|0;if((p|0)==0){h=l;i=e;return h|0}am(p|0)|0;c[202]=0;h=l;i=e;return h|0}}while(0);am(c[202]|0)|0;c[202]=0;h=0;i=e;return h|0}function a5(f,g){f=f|0;g=g|0;var h=0,i=0,j=0,k=0,l=0,n=0,o=0,p=0;h=0;do{i=h>>>1;j=(h&1|0)!=0?i^-306674912:i;i=j>>>1;k=(j&1|0)!=0?i^-306674912:i;i=k>>>1;j=(k&1|0)!=0?i^-306674912:i;i=j>>>1;k=(j&1|0)!=0?i^-306674912:i;i=k>>>1;j=(k&1|0)!=0?i^-306674912:i;i=j>>>1;k=(j&1|0)!=0?i^-306674912:i;i=k>>>1;j=(k&1|0)!=0?i^-306674912:i;i=j>>>1;c[17704+(h<<2)>>2]=(j&1|0)!=0?i^-306674912:i;h=h+1|0;}while((h|0)<256);h=aq(f|0,160)|0;c[202]=h;if((h|0)==0){l=0;return l|0}do{if((al(800,1,7,h|0)|0)==7){f=(t=d[800]|d[801|0]<<8,t<<16>>16)<<16>>16==24914&(a[802]|0)==114;i=f&(t=d[803]|d[804|0]<<8,t<<16>>16)<<16>>16==6689;if(!(i&(t=d[805]|d[806|0]<<8,t<<16>>16)<<16>>16==7)){i=c[m>>2]|0;aJ(40,114,1,i|0)|0;break}if((a8(115)|0)!=13){break}i=bj(1048576)|0;c[592]=i;if((i|0)==0){l=0;return l|0}i=c[202]|0;f=((t=d[821]|d[822|0]<<8,t<<16>>16)&65535)-13|0;aw(i|0,f|0,1)|0;c[g>>2]=0;f=(a6(32884)|0)<1;if(f|(a[18730]|0)==119){n=0}else{f=0;i=0;while(1){j=(c[g>>2]|0)==0;k=bj(40)|0;o=k;if(j){c[k+36>>2]=0;c[g>>2]=o}else{c[f+36>>2]=o;c[k+36>>2]=0}j=bj((e[1519]|0)+1|0)|0;c[k>>2]=j;bq(j|0,c[4836]|0)|0;b[k+4>>1]=b[1519]|0;c[k+8>>2]=c[754];c[k+12>>2]=c[755];a[k+16|0]=a[3024]|0;c[k+20>>2]=c[757];c[k+24>>2]=c[758];a[k+28|0]=a[3036]|0;a[k+29|0]=a[3037]|0;c[k+32>>2]=c[760];k=i+1|0;j=c[202]|0;if((j|0)!=0){p=c[750]|0;aw(j|0,p|0,0)|0}p=(a6(32884)|0)<1;if(p|(a[18730]|0)==119){n=k;break}else{f=o;i=k}}}i=c[732]|0;if((i|0)!=0){bk(i)}c[732]=aA(832)|0;i=c[202]|0;if((i|0)!=0){am(i|0)|0;c[202]=0}i=c[592]|0;if((i|0)!=0){bk(i)}i=c[600]|0;if((i|0)!=0){bk(i)}i=c[4422]|0;if((i|0)!=0){bk(i)}c[592]=0;c[600]=0;c[4422]=0;l=n;return l|0}}while(0);am(c[202]|0)|0;c[202]=0;l=0;return l|0}function a6(d){d=d|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0;f=i;i=i+56|0;g=f+48|0;h=f|0;br(h|0,3008,44)|0;j=d&255;c[4420]=az(c[202]|0)|0;k=a8(116)|0;L149:do{if((k|0)==0){l=1;m=0;n=d&255}else{o=(j|0)==0;p=d&255;q=(d&32768|0)!=0;if((j|0)==119){r=k;while(1){s=b[1507]|0;if((s&65535)<7){t=0;u=155;break}v=c[4420]|0;w=v+(s&65535)|0;c[750]=w;if((b[1506]|0)<0){s=(c[754]|0)+w|0;c[750]=s;x=s}else{x=w}if((x|0)<=(v|0)){t=0;u=156;break}v=(r|0)<1;if(o){l=v;m=r;n=p;break L149}w=a[3010]|0;if(w<<24>>24==p<<24>>24){l=v;m=r;n=p;break L149}if(q&w<<24>>24==119&(c[668]|0)==119){l=v;m=r;n=p;break L149}aw(c[202]|0,x|0,0)|0;c[4420]=az(c[202]|0)|0;v=a8(116)|0;if((v|0)==0){l=1;m=0;n=p;break L149}else{r=v}}if((u|0)==155){i=f;return t|0}else if((u|0)==156){i=f;return t|0}}if(o){r=b[1507]|0;if((r&65535)<7){t=0;i=f;return t|0}v=c[4420]|0;w=v+(r&65535)|0;c[750]=w;if((b[1506]|0)<0){r=(c[754]|0)+w|0;c[750]=r;y=r}else{y=w}if((y|0)<=(v|0)){t=0;i=f;return t|0}if((k|0)<1){l=1;m=k;n=p;break}c[668]=0;l=0;m=k;n=p;break}else{z=k}while(1){v=b[1507]|0;if((v&65535)<7){t=0;u=159;break}w=c[4420]|0;r=w+(v&65535)|0;c[750]=r;if((b[1506]|0)<0){v=(c[754]|0)+r|0;c[750]=v;A=v}else{A=r}if((A|0)<=(w|0)){t=0;u=160;break}w=(z|0)<1;if(!w){c[668]=j}r=a[3010]|0;if(r<<24>>24==p<<24>>24){l=w;m=z;n=p;break L149}if(q&r<<24>>24==119&(c[668]|0)==(j|0)){l=w;m=z;n=p;break L149}aw(c[202]|0,A|0,0)|0;c[4420]=az(c[202]|0)|0;w=a8(116)|0;if((w|0)==0){l=1;m=0;n=p;break L149}else{z=w}}if((u|0)==159){i=f;return t|0}else if((u|0)==160){i=f;return t|0}}}while(0);b[9364]=b[1504]|0;u=a[3010]|0;a[18730]=u;b[9366]=b[1506]|0;b[9367]=b[1507]|0;c[4684]=c[754];if((j|0)!=116|u<<24>>24!=n<<24>>24|l){br(3008,h|0,44)|0;h=c[202]|0;l=c[4420]|0;aw(h|0,l|0,0)|0;t=m;i=f;return t|0}l=bl(c[4836]|0,(e[1519]|0)+1|0)|0;c[4836]=l;al(l|0,1,e[1519]|0,c[202]|0)|0;a[(c[4836]|0)+(e[1519]|0)|0]=0;l=(e[1519]|0)+m|0;m=b[1506]|0;do{if((m&1024)==0){B=l;C=m}else{c[g>>2]=0;c[g+4>>2]=0;if((l|0)>=(e[1507]|0)){B=l;C=m;break}h=(al(g|0,1,8,c[202]|0)|0)+l|0;B=h;C=b[1506]|0}}while(0);if((C&4096)==0){t=B;i=f;return t|0}if((B|0)<(e[1507]|0)){C=ak(c[202]|0)|0;D=((ak(c[202]|0)|0)<<8|C)&65535;E=B+2|0}else{D=0;E=B}B=E;E=0;while(1){C=E<<2;L211:do{if((1<<15-C&D|0)==0){F=B}else{do{if((E|0)==0){G=B}else{if((B|0)>=(e[1507]|0)){G=B;break}l=c[202]|0;aw(l|0,4,1)|0;G=B+4|0}}while(0);l=D>>>((12-C|0)>>>0)&3;if((l|0)==0){F=G;break}else{H=G;I=1}while(1){if((H|0)<(e[1507]|0)){g=c[202]|0;ak(g|0)|0;J=H+1|0}else{J=H}if((I|0)>=(l|0)){F=J;break L211}H=J;I=I+1|0}}}while(0);C=E+1|0;if((C|0)<4){B=F;E=C}else{t=F;break}}i=f;return t|0}function a7(a){a=a|0;var b=0;if((a|0)==0){return}else{b=a}while(1){a=c[b+36>>2]|0;bk(c[b>>2]|0);bk(b);if((a|0)==0){break}else{b=a}}return}function a8(e){e=e|0;var f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,v=0,w=0,x=0;f=i;i=i+72|0;g=f|0;h=f+64|0;if((e|0)==115){j=g|0;k=al(j|0,1,13,c[202]|0)|0;u=d[g+1|0]<<8|d[j];a[816]=u&255;u=u>>8;a[817|0]=u&255;j=a[g+2|0]|0;a[818]=j;l=a[g+3|0]|0;m=a[g+4|0]|0;u=(m&255)<<8|l&255;a[819]=u&255;u=u>>8;a[820|0]=u&255;n=a[g+5|0]|0;o=a[g+6|0]|0;u=(o&255)<<8|n&255;a[821]=u&255;u=u>>8;a[822|0]=u&255;p=a[g+7|0]|0;q=a[g+8|0]|0;u=(q&255)<<8|p&255;a[823]=u&255;u=u>>8;a[824|0]=u&255;r=d[g+9|0]|0;s=d[g+10|0]|0;t=d[g+11|0]|0;v=d[g+12|0]|0;u=s<<8|r|t<<16|v<<24;a[825]=u&255;u=u>>8;a[826|0]=u&255;u=u>>8;a[827|0]=u&255;u=u>>8;a[828|0]=u&255;w=c[17704+((j&255^255)<<2)>>2]^16777215;j=c[17704+((l&255^w&255)<<2)>>2]^w>>>8;w=c[17704+((m&255^j&255)<<2)>>2]^j>>>8;j=c[17704+((n&255^w&255)<<2)>>2]^w>>>8;w=c[17704+((o&255^j&255)<<2)>>2]^j>>>8;j=c[17704+((p&255^w&255)<<2)>>2]^w>>>8;w=c[17704+((q&255^j&255)<<2)>>2]^j>>>8;j=c[17704+((r^w&255)<<2)>>2]^w>>>8;w=c[17704+((s^j&255)<<2)>>2]^j>>>8;j=c[17704+((t^w&255)<<2)>>2]^w>>>8;c[4318]=c[17704+((v^j&255)<<2)>>2]^j>>>8;x=k;i=f;return x|0}else if((e|0)==116){e=g|0;k=al(e|0,1,32,c[202]|0)|0;b[1504]=d[g+1|0]<<8|d[e];a[3010]=a[g+2|0]|0;b[1506]=d[g+4|0]<<8|d[g+3|0];b[1507]=d[g+6|0]<<8|d[g+5|0];c[754]=d[g+8|0]<<8|d[g+7|0]|d[g+9|0]<<16|d[g+10|0]<<24;c[755]=d[g+12|0]<<8|d[g+11|0]|d[g+13|0]<<16|d[g+14|0]<<24;a[3024]=a[g+15|0]|0;c[757]=d[g+17|0]<<8|d[g+16|0]|d[g+18|0]<<16|d[g+19|0]<<24;c[758]=d[g+21|0]<<8|d[g+20|0]|d[g+22|0]<<16|d[g+23|0]<<24;a[3036]=a[g+24|0]|0;a[3037]=a[g+25|0]|0;b[1519]=d[g+27|0]<<8|d[g+26|0];c[760]=d[g+29|0]<<8|d[g+28|0]|d[g+30|0]<<16|d[g+31|0]<<24;if((b[1506]&256)==0){e=-1;j=0;do{e=c[17704+((d[g+(j+2)|0]^e&255)<<2)>>2]^e>>>8;j=j+1|0;}while(j>>>0<30);c[4318]=e;c[761]=0;c[762]=0;x=k;i=f;return x|0}e=h|0;j=al(e|0,1,8,c[202]|0)|0;c[761]=((a[h+1|0]&65535)<<8)+(a[e]|0)+(a[h+2|0]<<16)+(d[h+3|0]<<24);c[762]=((a[h+5|0]&65535)<<8)+(a[h+4|0]|0)+(a[h+6|0]<<16)+(d[h+7|0]<<24);h=-1;e=0;do{h=c[17704+((d[g+(e+2)|0]^h&255)<<2)>>2]^h>>>8;e=e+1|0;}while(e>>>0<30);c[4318]=h;x=j+k|0;i=f;return x|0}else{x=0;i=f;return x|0}return 0}function a9(b,c){b=b|0;c=c|0;var d=0,e=0,f=0,g=0,h=0;d=i;i=i+1024|0;e=d|0;bt(e|0,b|0,512)|0;b=d+512|0;bt(b|0,c|0,512)|0;c=as(e|0,92)|0;if((c|0)!=0){f=c;do{a[f]=95;f=as(e|0,92)|0;}while((f|0)!=0)}f=as(b|0,92)|0;if((f|0)!=0){c=f;do{a[c]=95;c=as(b|0,92)|0;}while((c|0)!=0)}c=as(e|0,47)|0;if((c|0)!=0){f=c;do{a[f]=95;f=as(e|0,47)|0;}while((f|0)!=0)}f=as(b|0,47)|0;if((f|0)==0){g=bw(e|0,b|0)|0;i=d;return g|0}else{h=f}do{a[h]=95;h=as(b|0,47)|0;}while((h|0)!=0);g=bw(e|0,b|0)|0;i=d;return g|0}function ba(b){b=b|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0;e=i;i=i+256|0;f=e|0;bi(b);c[2262]=-744245127;c[2263]=1064112887;c[2264]=1964352053;c[2265]=-1528303325;g=f|0;bs(g|0,0,256);bq(g|0,b|0)|0;g=bp(b|0)|0;br(2408,504,256)|0;b=(g|0)==0;h=0;do{if(!b){j=0;do{k=c[17704+(((d[f+j|0]|0)-h&255)<<2)>>2]|0;l=k&255;m=c[17704+(((d[f+(j|1)|0]|0)+h&255)<<2)>>2]&255;if((l|0)!=(m|0)){n=1;o=k&255;k=l;while(1){l=2408+k|0;p=a[l]|0;q=2408+(n+j+k&255)|0;a[l]=a[q]|0;a[q]=p;p=o+1&255;q=p&255;if((q|0)==(m|0)){break}else{n=n+1|0;o=p;k=q}}}j=j+2|0;}while(j>>>0<g>>>0)}h=h+1|0;}while(h>>>0<256);if(b){i=e;return}else{r=0}do{bf(f+r|0);r=r+16|0;}while(r>>>0<g>>>0);i=e;return}function bb(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0;c[596]=e;c[4314]=0;c[4316]=0;if((b[1506]&16)==0){c[4418]=0;c[4424]=0;bs(18960,0,368);bs(2976,0,16);c[742]=0;c[1926]=0;c[1928]=0;bs(e|0,0,1048576);bs(1336,0,1028);c[328]=0;c[330]=0}e=c[332]|0;f=c[202]|0;do{if((f|0)==0){g=0}else{h=al(9064,1,(e>>>0<8192?e:8192)|0,f|0)|0;c[4416]=(c[4416]|0)+h;c[332]=(c[332]|0)-h;if((h|0)==-1|(c[4322]|0)<20){g=h;break}if((h|0)==0){g=0;break}else{i=0}while(1){bg(9064+i|0);j=i+16|0;if(j>>>0<h>>>0){i=j}else{g=h;break}}}}while(0);c[666]=g;c[4316]=0;if((b[1506]&16)==0){bd()}g=c[4326]|0;c[4326]=g-1;if((g|0)>0){do{c[330]=c[330]&1048575;g=c[4316]|0;L299:do{if(g>>>0>8162){br(9064,17224,32)|0;c[4316]=g&31;i=c[332]|0;f=c[202]|0;do{if((f|0)!=0){e=al(9096,1,(i>>>0<8160?i:8160)|0,f|0)|0;c[4416]=(c[4416]|0)+e;c[332]=(c[332]|0)-e;if(!((e|0)==-1|(c[4322]|0)<20)){if((e|0)==0){break}else{k=0}do{bg(k+9096|0);k=k+16|0;}while(k>>>0<e>>>0)}if((e|0)<=0){break}c[666]=e+32;break L299}}while(0);c[666]=c[4316]}}while(0);g=c[328]|0;f=c[330]|0;if(!((g-f&1048574)>>>0>269|(g|0)==(f|0))){do{if((a[17280]&1)!=0){i=c[c[190]>>2]|0;if(f>>>0<g>>>0){if((i+f|0)>>>0>(c[755]|0)>>>0){c[4326]=-1;break}else{h=(c[192]|0)+i|0;j=(c[596]|0)+g|0;l=-g&1048575;br(h|0,j|0,l)|0;l=c[190]|0;c[l>>2]=(c[l>>2]|0)+(-(c[328]|0)&1048575);l=(c[192]|0)+(c[c[190]>>2]|0)|0;j=c[596]|0;h=c[330]|0;br(l|0,j|0,h)|0;h=c[190]|0;c[h>>2]=(c[h>>2]|0)+(c[330]|0);break}}else{h=f-g|0;if((i+h|0)>>>0>(c[755]|0)>>>0){c[4326]=-1;break}else{j=(c[192]|0)+i|0;i=(c[596]|0)+g|0;br(j|0,i|0,h)|0;h=c[190]|0;c[h>>2]=(c[330]|0)-(c[328]|0)+(c[h>>2]|0);break}}}}while(0);c[328]=c[330]}L326:do{if((c[598]|0)==0){c[4328]=c[1930];c[4329]=7724;c[4330]=7788;c[4331]=7852;bc(17312);g=c[748]|0;if(g>>>0<256){f=c[330]|0;c[330]=f+1;a[(c[596]|0)+f|0]=g&255;f=(c[4326]|0)-1|0;c[4326]=f;m=f;break}if(g>>>0>269){f=g-270|0;c[748]=f;h=(d[184+f|0]|0)+3|0;c[1924]=h;i=d[216+f|0]|0;if((g-278|0)>>>0<20){f=c[4316]|0;j=c[4314]|0;l=((d[f+9065|0]|0)<<8|(d[9064+f|0]|0)<<16|(d[f+9066|0]|0))>>>((8-j|0)>>>0)&65535;c[4686]=l;c[1924]=(l>>>((16-i|0)>>>0))+h;h=j+i|0;c[4316]=(h>>>3)+f;c[4314]=h&7}c[4328]=c[4332];c[4329]=17332;c[4330]=17396;c[4331]=17460;bc(17312);h=c[748]|0;f=(c[248+(h<<2)>>2]|0)+1|0;c[4324]=f;i=d[440+h|0]|0;if((h-4|0)>>>0<44){h=c[4316]|0;j=c[4314]|0;l=((d[h+9065|0]|0)<<8|(d[9064+h|0]|0)<<16|(d[h+9066|0]|0))>>>((8-j|0)>>>0)&65535;c[4686]=l;n=(l>>>((16-i|0)>>>0))+f|0;c[4324]=n;l=j+i|0;c[4316]=(l>>>3)+h;c[4314]=l&7;o=n}else{o=f}if(o>>>0>262143){c[1924]=(c[1924]|0)+1}f=c[1924]|0;if(o>>>0>8191){n=f+1|0;c[1924]=n;p=n}else{p=f}f=c[742]|0;c[742]=f+1;c[2976+((f&3)<<2)>>2]=o;c[1928]=o;c[1926]=p;c[4326]=(c[4326]|0)-p;c[1924]=p-1;if((p|0)==0){q=213;break}f=c[330]|0;n=o;while(1){l=c[596]|0;a[l+f|0]=a[l+(f-n&1048575)|0]|0;l=(c[330]|0)+1&1048575;c[330]=l;h=c[1924]|0;c[1924]=h-1;if((h|0)==0){q=213;break L326}f=l;n=c[4324]|0}}if((g|0)==269){bd();q=213;break}else if((g|0)==256){n=c[1926]|0;f=c[1928]|0;c[4324]=f;l=c[742]|0;c[742]=l+1;c[2976+((l&3)<<2)>>2]=f;c[4326]=(c[4326]|0)-n;c[1924]=n-1;if((n|0)==0){q=213;break}n=c[330]|0;l=f;while(1){f=c[596]|0;a[f+n|0]=a[f+(n-l&1048575)|0]|0;f=(c[330]|0)+1&1048575;c[330]=f;h=c[1924]|0;c[1924]=h-1;if((h|0)==0){q=213;break L326}n=f;l=c[4324]|0}}else{if(g>>>0>=261){l=g-261|0;c[748]=l;n=(d[168+l|0]|0)+1|0;f=d[176+l|0]|0;l=c[4316]|0;h=c[4314]|0;i=((d[l+9065|0]|0)<<8|(d[9064+l|0]|0)<<16|(d[l+9066|0]|0))>>>((8-h|0)>>>0)&65535;c[4686]=i;j=(i>>>((16-f|0)>>>0))+n|0;c[4324]=j;n=h+f|0;c[4316]=(n>>>3)+l;c[4314]=n&7;n=c[742]|0;c[742]=n+1;c[2976+((n&3)<<2)>>2]=j;c[1928]=j;c[1926]=2;c[4326]=(c[4326]|0)-2;c[1924]=1;n=c[330]|0;l=j;while(1){j=c[596]|0;a[j+n|0]=a[j+(n-l&1048575)|0]|0;j=(c[330]|0)+1&1048575;c[330]=j;f=c[1924]|0;c[1924]=f-1;if((f|0)==0){q=213;break L326}n=j;l=c[4324]|0}}c[4324]=c[2976+(((c[742]|0)-g&3)<<2)>>2];c[4328]=c[670];c[4329]=2684;c[4330]=2748;c[4331]=2812;bc(17312);l=c[748]|0;n=(d[184+l|0]|0)+2|0;c[1924]=n;j=d[216+l|0]|0;if((l-8|0)>>>0<20){l=c[4316]|0;f=c[4314]|0;h=((d[l+9065|0]|0)<<8|(d[9064+l|0]|0)<<16|(d[l+9066|0]|0))>>>((8-f|0)>>>0)&65535;c[4686]=h;i=(h>>>((16-j|0)>>>0))+n|0;c[1924]=i;h=f+j|0;c[4316]=(h>>>3)+l;c[4314]=h&7;r=i}else{r=n}n=c[4324]|0;if(n>>>0>262143){i=r+1|0;c[1924]=i;s=i;q=264}else{if(n>>>0>8191){s=r;q=264}else{t=r}}if((q|0)==264){q=0;i=s+1|0;c[1924]=i;t=i}if(n>>>0>256){i=t+1|0;c[1924]=i;u=i}else{u=t}i=c[742]|0;c[742]=i+1;c[2976+((i&3)<<2)>>2]=n;c[1928]=n;c[1926]=u;c[4326]=(c[4326]|0)-u;c[1924]=u-1;if((u|0)==0){q=213;break}i=c[330]|0;h=n;while(1){n=c[596]|0;a[n+i|0]=a[n+(i-h&1048575)|0]|0;n=(c[330]|0)+1&1048575;c[330]=n;l=c[1924]|0;c[1924]=l-1;if((l|0)==0){q=213;break L326}i=n;h=c[4324]|0}}}else{bc(c[488+(c[4418]<<2)>>2]|0);h=c[748]|0;if((h|0)==256){bd();q=213;break}else{i=be(h)|0;h=c[330]|0;c[330]=h+1;a[(c[596]|0)+h|0]=i;i=(c[4418]|0)+1|0;c[4418]=(i|0)==(c[594]|0)?0:i;i=(c[4326]|0)-1|0;c[4326]=i;m=i;break}}}while(0);if((q|0)==213){q=0;m=c[4326]|0}}while((m|0)>-1)}do{if((c[666]|0)>>>0>=((c[4316]|0)+5|0)>>>0){if((c[598]|0)==0){c[4328]=c[1930];c[4329]=7724;c[4330]=7788;c[4331]=7852;bc(17312);if((c[748]|0)!=269){break}bd();break}else{m=c[488+(c[4418]<<2)>>2]|0;c[4328]=c[m>>2];c[4329]=m+4;c[4330]=m+68;c[4331]=m+132;bc(17312);if((c[748]|0)!=256){break}bd();break}}}while(0);if((a[17280]&1)==0){v=c[330]|0;c[328]=v;return}m=c[330]|0;q=c[328]|0;u=c[c[190]>>2]|0;if(m>>>0<q>>>0){if((u+m|0)>>>0>(c[755]|0)>>>0){c[4326]=-1;v=c[330]|0;c[328]=v;return}else{t=(c[192]|0)+u|0;s=(c[596]|0)+q|0;r=-q&1048575;br(t|0,s|0,r)|0;r=c[190]|0;c[r>>2]=(c[r>>2]|0)+(-(c[328]|0)&1048575);r=(c[192]|0)+(c[c[190]>>2]|0)|0;s=c[596]|0;t=c[330]|0;br(r|0,s|0,t)|0;t=c[190]|0;c[t>>2]=(c[t>>2]|0)+(c[330]|0);v=c[330]|0;c[328]=v;return}}else{t=m-q|0;if((u+t|0)>>>0>(c[755]|0)>>>0){c[4326]=-1;v=c[330]|0;c[328]=v;return}else{m=(c[192]|0)+u|0;u=(c[596]|0)+q|0;br(m|0,u|0,t)|0;t=c[190]|0;c[t>>2]=(c[330]|0)-(c[328]|0)+(c[t>>2]|0);v=c[330]|0;c[328]=v;return}}}function bc(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0;b=c[4316]|0;e=c[4314]|0;f=((d[b+9065|0]|0)<<8|(d[9064+b|0]|0)<<16|(d[b+9066|0]|0))>>>((8-e|0)>>>0);c[4686]=f&65535;g=f&65534;f=a+4|0;h=c[f>>2]|0;do{if(g>>>0<(c[h+32>>2]|0)>>>0){if(g>>>0<(c[h+16>>2]|0)>>>0){if(g>>>0<(c[h+8>>2]|0)>>>0){i=g>>>0<(c[h+4>>2]|0)>>>0?1:2;break}else{i=g>>>0<(c[h+12>>2]|0)>>>0?3:4;break}}else{if(g>>>0<(c[h+24>>2]|0)>>>0){i=g>>>0<(c[h+20>>2]|0)>>>0?5:6;break}else{i=g>>>0<(c[h+28>>2]|0)>>>0?7:8;break}}}else{if(g>>>0>=(c[h+48>>2]|0)>>>0){if(g>>>0>=(c[h+56>>2]|0)>>>0){i=15;break}i=g>>>0<(c[h+52>>2]|0)>>>0?13:14;break}if(g>>>0<(c[h+40>>2]|0)>>>0){i=g>>>0<(c[h+36>>2]|0)>>>0?9:10;break}else{i=g>>>0<(c[h+44>>2]|0)>>>0?11:12;break}}}while(0);h=e+i|0;c[4316]=(h>>>3)+b;c[4314]=h&7;h=((g-(c[(c[f>>2]|0)+(i-1<<2)>>2]|0)|0)>>>((16-i|0)>>>0))+(c[(c[a+8>>2]|0)+(i<<2)>>2]|0)|0;c[748]=c[(c[a+12>>2]|0)+((h>>>0>=(c[a>>2]|0)>>>0?0:h)<<2)>>2];return}function bd(){var b=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0;b=i;i=i+1056|0;e=b|0;f=b+24|0;g=c[4316]|0;L434:do{if(g>>>0>8167){br(9064,17224,32)|0;c[4316]=g&31;h=c[332]|0;j=c[202]|0;do{if((j|0)!=0){k=al(9096,1,(h>>>0<8160?h:8160)|0,j|0)|0;c[4416]=(c[4416]|0)+k;c[332]=(c[332]|0)-k;if(!((k|0)==-1|(c[4322]|0)<20)){if((k|0)==0){break}else{l=0}do{bg(l+9096|0);l=l+16|0;}while(l>>>0<k>>>0)}if((k|0)<=0){break}c[666]=k+32;m=c[4316]|0;break L434}}while(0);j=c[4316]|0;c[666]=j;m=j}else{m=g}}while(0);g=c[4314]|0;l=((d[m+9065|0]|0)<<8|(d[9064+m|0]|0)<<16|(d[m+9066|0]|0))>>>((8-g|0)>>>0);c[4686]=l&65535;j=l&32768;c[598]=j;if((l&16384|0)==0){bs(1336,0,1028)}h=g+2|0;n=(h>>>3)+m|0;c[4316]=n;m=h&7;c[4314]=m;if((j|0)==0){o=374;p=n;q=m}else{j=(l>>>12&3)+1|0;c[594]=j;if((c[4418]|0)>=(j|0)){c[4418]=0}l=((m+2|0)>>>3)+n|0;c[4316]=l;n=g+4&7;c[4314]=n;o=j*257|0;p=l;q=n}n=0;l=p;p=q;do{r=((d[l+9065|0]|0)<<8|(d[9064+l|0]|0)<<16|(d[l+9066|0]|0))>>>((8-p|0)>>>0)&65535;a[e+n|0]=r>>>12&255;q=p+4|0;l=(q>>>3)+l|0;p=q&7;n=n+1|0;}while((n|0)<19);c[4316]=l;c[4314]=p;c[4686]=r;c[4328]=c[4688];c[4329]=18756;c[4330]=18820;c[4331]=18884;bh(e|0,19);c[4688]=c[4328];if((o|0)>0){e=0;while(1){r=c[4316]|0;L461:do{if(r>>>0>8187){br(9064,17224,32)|0;c[4316]=r&31;p=c[332]|0;l=c[202]|0;do{if((l|0)!=0){n=al(9096,1,(p>>>0<8160?p:8160)|0,l|0)|0;c[4416]=(c[4416]|0)+n;c[332]=(c[332]|0)-n;if(!((n|0)==-1|(c[4322]|0)<20)){if((n|0)==0){break}else{s=0}do{bg(s+9096|0);s=s+16|0;}while(s>>>0<n>>>0)}if((n|0)<=0){break}c[666]=n+32;break L461}}while(0);c[666]=c[4316]}}while(0);c[4328]=c[4688];c[4329]=18756;c[4330]=18820;c[4331]=18884;bc(17312);r=c[748]|0;do{if(r>>>0<16){a[f+e|0]=(d[1336+e|0]|0)+r&15;t=e+1|0}else{if((r|0)==16){l=c[4316]|0;p=c[4314]|0;k=((d[l+9065|0]|0)<<8|(d[9064+l|0]|0)<<16|(d[l+9066|0]|0))>>>((8-p|0)>>>0);q=k&65535;c[4686]=q;j=p+2|0;c[4316]=(j>>>3)+l;c[4314]=j&7;if((e|0)>=(o|0)){t=e;break}j=e-o|0;l=k>>>14&3;k=-3-l|0;p=((k|0)>-1?-4-k|0:-3)-l|0;l=j>>>0>p>>>0?j:p;p=(q>>>14)+3|0;q=e;do{p=p-1|0;a[f+q|0]=a[f+(q-1)|0]|0;q=q+1|0;}while((p|0)>0&(q|0)<(o|0));t=e-l|0;break}q=c[4316]|0;p=c[4314]|0;j=((d[q+9065|0]|0)<<8|(d[9064+q|0]|0)<<16|(d[q+9066|0]|0))>>>((8-p|0)>>>0)&65535;c[4686]=j;if((r|0)==17){u=(j>>>13)+3|0;v=p+3|0}else{u=(j>>>9)+11|0;v=p+7|0}c[4316]=(v>>>3)+q;c[4314]=v&7;if(!((u|0)>0&(e|0)<(o|0))){t=e;break}q=-u|0;p=e-o|0;j=p>>>0<q>>>0?q:p;bs(f+e|0,0,-j|0);t=e-j|0}}while(0);if((t|0)<(o|0)){e=t}else{break}}}if((c[598]|0)==0){t=f|0;c[4328]=c[1930];c[4329]=7724;c[4330]=7788;c[4331]=7852;bh(t,298);c[1930]=c[4328];c[4328]=c[4332];c[4329]=17332;c[4330]=17396;c[4331]=17460;bh(f+298|0,48);c[4332]=c[4328];c[4328]=c[670];c[4329]=2684;c[4330]=2748;c[4331]=2812;bh(f+346|0,28);c[670]=c[4328];w=t;br(1336,w|0,1028)|0;i=b;return}if((c[594]|0)>0){t=0;do{e=c[488+(t<<2)>>2]|0;o=e|0;c[4328]=c[o>>2];c[4329]=e+4;c[4330]=e+68;c[4331]=e+132;bh(f+(t*257|0)|0,257);c[o>>2]=c[4328];t=t+1|0;}while((t|0)<(c[594]|0))}w=f|0;br(1336,w|0,1028)|0;i=b;return}function be(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;b=c[4418]|0;d=19044+(b*92|0)|0;c[d>>2]=(c[d>>2]|0)+1;e=18988+(b*92|0)|0;f=c[e>>2]|0;g=18992+(b*92|0)|0;c[g>>2]=f;h=18984+(b*92|0)|0;i=c[h>>2]|0;c[e>>2]=i;e=18996+(b*92|0)|0;j=c[e>>2]|0;k=18980+(b*92|0)|0;l=j-(c[k>>2]|0)|0;c[h>>2]=l;c[k>>2]=j;k=19048+(b*92|0)|0;h=c[k>>2]<<3;m=18960+(b*92|0)|0;n=(_(c[m>>2]|0,j)|0)+h|0;h=18964+(b*92|0)|0;o=n+(_(l,c[h>>2]|0)|0)|0;n=18968+(b*92|0)|0;p=o+(_(i,c[n>>2]|0)|0)|0;o=18972+(b*92|0)|0;q=p+(_(f,c[o>>2]|0)|0)|0;p=18976+(b*92|0)|0;r=c[4424]|0;s=((q+(_(r,c[p>>2]|0)|0)|0)>>>3&255)-a|0;q=a<<24;a=q>>21;t=19e3+(b*92|0)|0;u=(c[t>>2]|0)+((q|0)>-2097152?a:-a|0)|0;c[t>>2]=u;q=a-j|0;v=19004+(b*92|0)|0;w=((q|0)>-1?q:-q|0)+(c[v>>2]|0)|0;c[v>>2]=w;v=j+a|0;j=19008+(b*92|0)|0;q=((v|0)>-1?v:-v|0)+(c[j>>2]|0)|0;c[j>>2]=q;j=a-l|0;v=19012+(b*92|0)|0;x=((j|0)>-1?j:-j|0)+(c[v>>2]|0)|0;c[v>>2]=x;v=l+a|0;l=19016+(b*92|0)|0;j=((v|0)>-1?v:-v|0)+(c[l>>2]|0)|0;c[l>>2]=j;l=a-i|0;v=19020+(b*92|0)|0;y=((l|0)>-1?l:-l|0)+(c[v>>2]|0)|0;c[v>>2]=y;v=i+a|0;i=19024+(b*92|0)|0;l=((v|0)>-1?v:-v|0)+(c[i>>2]|0)|0;c[i>>2]=l;i=a-f|0;f=19028+(b*92|0)|0;v=((i|0)>-1?i:-i|0)+(c[f>>2]|0)|0;c[f>>2]=v;f=(c[g>>2]|0)+a|0;g=19032+(b*92|0)|0;i=((f|0)>-1?f:-f|0)+(c[g>>2]|0)|0;c[g>>2]=i;g=a-r|0;f=19036+(b*92|0)|0;z=((g|0)>-1?g:-g|0)+(c[f>>2]|0)|0;c[f>>2]=z;f=r+a|0;a=19040+(b*92|0)|0;b=((f|0)>-1?f:-f|0)+(c[a>>2]|0)|0;c[a>>2]=b;a=s-(c[k>>2]|0)<<24>>24;c[e>>2]=a;c[4424]=a;c[k>>2]=s;if((c[d>>2]&31|0)!=0){A=s&255;return A|0}d=w>>>0<u>>>0;k=d?w:u;u=q>>>0<k>>>0;w=u?q:k;k=x>>>0<w>>>0;q=k?x:w;w=j>>>0<q>>>0;x=w?j:q;q=y>>>0<x>>>0;j=q?y:x;x=l>>>0<j>>>0;y=x?l:j;j=v>>>0<y>>>0;l=j?v:y;y=i>>>0<l>>>0;v=y?i:l;l=z>>>0<v>>>0;i=b>>>0<(l?z:v)>>>0?10:l?9:y?8:j?7:x?6:q?5:w?4:k?3:u?2:d&1;bs(t|0,0,44);if((i|0)==1){t=c[m>>2]|0;if((t|0)<=-17){A=s&255;return A|0}c[m>>2]=t-1;A=s&255;return A|0}else if((i|0)==2){t=c[m>>2]|0;if((t|0)>=16){A=s&255;return A|0}c[m>>2]=t+1;A=s&255;return A|0}else if((i|0)==3){t=c[h>>2]|0;if((t|0)<=-17){A=s&255;return A|0}c[h>>2]=t-1;A=s&255;return A|0}else if((i|0)==4){t=c[h>>2]|0;if((t|0)>=16){A=s&255;return A|0}c[h>>2]=t+1;A=s&255;return A|0}else if((i|0)==5){t=c[n>>2]|0;if((t|0)<=-17){A=s&255;return A|0}c[n>>2]=t-1;A=s&255;return A|0}else if((i|0)==6){t=c[n>>2]|0;if((t|0)>=16){A=s&255;return A|0}c[n>>2]=t+1;A=s&255;return A|0}else if((i|0)==7){t=c[o>>2]|0;if((t|0)<=-17){A=s&255;return A|0}c[o>>2]=t-1;A=s&255;return A|0}else if((i|0)==8){t=c[o>>2]|0;if((t|0)>=16){A=s&255;return A|0}c[o>>2]=t+1;A=s&255;return A|0}else if((i|0)==9){t=c[p>>2]|0;if((t|0)<=-17){A=s&255;return A|0}c[p>>2]=t-1;A=s&255;return A|0}else if((i|0)==10){i=c[p>>2]|0;if((i|0)>=16){A=s&255;return A|0}c[p>>2]=i+1;A=s&255;return A|0}else{A=s&255;return A|0}return 0}function bf(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=a;e=c[2262]|0;f=a+4|0;g=f;h=a+8|0;i=h;j=a+12|0;k=j;l=c[2265]^c[k>>2];m=c[2264]^c[i>>2];n=c[2263]^c[g>>2];o=e^c[b>>2];p=0;while(1){q=c[9048+((p&3)<<2)>>2]|0;r=q^(l<<11|l>>>21)+m;s=((d[2408+(r>>>8&255)|0]|0)<<8|(d[2408+(r&255)|0]|0)|(d[2408+(r>>>16&255)|0]|0)<<16|(d[2408+(r>>>24)|0]|0)<<24)^o;r=q+((m<<17|m>>>15)^l)|0;t=((d[2408+(r>>>8&255)|0]|0)<<8|(d[2408+(r&255)|0]|0)|(d[2408+(r>>>16&255)|0]|0)<<16|(d[2408+(r>>>24)|0]|0)<<24)^n;r=p+1|0;if((r|0)<32){n=l;l=t;o=m;m=s;p=r}else{break}}p=e^s;c[b>>2]=p;c[g>>2]=c[2263]^t;c[i>>2]=c[2264]^m;c[k>>2]=c[2265]^l;l=c[2263]|0;k=c[2264]|0;m=c[2265]|0;i=c[17704+((p&255)<<2)>>2]^c[2262];c[2262]=i;p=c[17704+((d[a+1|0]|0)<<2)>>2]^l;c[2263]=p;l=c[17704+((d[a+2|0]|0)<<2)>>2]^k;c[2264]=l;k=c[17704+((d[a+3|0]|0)<<2)>>2]^m;c[2265]=k;m=c[17704+((d[f]|0)<<2)>>2]^i;c[2262]=m;i=c[17704+((d[a+5|0]|0)<<2)>>2]^p;c[2263]=i;p=c[17704+((d[a+6|0]|0)<<2)>>2]^l;c[2264]=p;l=c[17704+((d[a+7|0]|0)<<2)>>2]^k;c[2265]=l;k=c[17704+((d[h]|0)<<2)>>2]^m;c[2262]=k;m=c[17704+((d[a+9|0]|0)<<2)>>2]^i;c[2263]=m;i=c[17704+((d[a+10|0]|0)<<2)>>2]^p;c[2264]=i;p=c[17704+((d[a+11|0]|0)<<2)>>2]^l;c[2265]=p;c[2262]=c[17704+((d[j]|0)<<2)>>2]^k;c[2263]=c[17704+((d[a+13|0]|0)<<2)>>2]^m;c[2264]=c[17704+((d[a+14|0]|0)<<2)>>2]^i;c[2265]=c[17704+((d[a+15|0]|0)<<2)>>2]^p;return}function bg(a){a=a|0;var b=0,e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0;b=i;i=i+16|0;e=b|0;f=a;g=c[2262]|0;h=g^c[f>>2];j=a+4|0;k=c[2263]^c[j>>2];l=a+8|0;m=c[2264]^c[l>>2];n=a+12|0;o=c[2265]^c[n>>2];p=e|0;br(p|0,a|0,16)|0;a=o;o=m;m=k;k=h;h=31;while(1){q=c[9048+((h&3)<<2)>>2]|0;r=q^(a<<11|a>>>21)+o;s=((d[2408+(r>>>8&255)|0]|0)<<8|(d[2408+(r&255)|0]|0)|(d[2408+(r>>>16&255)|0]|0)<<16|(d[2408+(r>>>24)|0]|0)<<24)^k;r=q+((o<<17|o>>>15)^a)|0;t=((d[2408+(r>>>8&255)|0]|0)<<8|(d[2408+(r&255)|0]|0)|(d[2408+(r>>>16&255)|0]|0)<<16|(d[2408+(r>>>24)|0]|0)<<24)^m;if((h|0)>0){m=a;a=t;k=o;o=s;h=h-1|0}else{break}}c[f>>2]=g^s;c[j>>2]=c[2263]^t;c[l>>2]=c[2264]^o;c[n>>2]=c[2265]^a;a=c[17704+((d[e+13|0]|0)<<2)>>2]^(c[17704+((d[e+9|0]|0)<<2)>>2]^(c[17704+((d[e+5|0]|0)<<2)>>2]^(c[17704+((d[e+1|0]|0)<<2)>>2]^c[2263])));n=c[17704+((d[e+14|0]|0)<<2)>>2]^(c[17704+((d[e+10|0]|0)<<2)>>2]^(c[17704+((d[e+6|0]|0)<<2)>>2]^(c[17704+((d[e+2|0]|0)<<2)>>2]^c[2264])));o=c[17704+((d[e+15|0]|0)<<2)>>2]^(c[17704+((d[e+11|0]|0)<<2)>>2]^(c[17704+((d[e+7|0]|0)<<2)>>2]^(c[17704+((d[e+3|0]|0)<<2)>>2]^c[2265])));c[2262]=c[17704+((d[e+12|0]|0)<<2)>>2]^(c[17704+((d[e+8|0]|0)<<2)>>2]^(c[17704+((d[e+4|0]|0)<<2)>>2]^(c[17704+((d[p]|0)<<2)>>2]^c[2262])));c[2263]=a;c[2264]=n;c[2265]=o;i=b;return}function bh(b,d){b=b|0;d=d|0;var e=0,f=0,g=0,h=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;e=i;i=i+128|0;f=e|0;g=e+64|0;bs(f|0,0,64);h=(d|0)>0;if(h){j=0;do{k=f+((a[b+j|0]&15)<<2)|0;c[k>>2]=(c[k>>2]|0)+1;j=j+1|0;}while((j|0)<(d|0))}c[f>>2]=0;c[c[4329]>>2]=0;c[c[4330]>>2]=0;c[g>>2]=0;j=1;k=0;l=0;while(1){m=c[f+(j<<2)>>2]|0;n=m+k<<1;o=n<<15-j;c[(c[4329]|0)+(j<<2)>>2]=(o|0)>65535?65535:o;o=c[4330]|0;p=l+(c[o+(j-1<<2)>>2]|0)|0;c[o+(j<<2)>>2]=p;c[g+(j<<2)>>2]=p;p=j+1|0;if((p|0)<16){j=p;k=n;l=m}else{break}}if(h){q=0}else{c[4328]=d;i=e;return}do{h=a[b+q|0]|0;if(h<<24>>24!=0){l=g+((h&15)<<2)|0;h=c[l>>2]|0;c[l>>2]=h+1;c[(c[4331]|0)+(h<<2)>>2]=q}q=q+1|0;}while((q|0)<(d|0));c[4328]=d;i=e;return}function bi(e){e=e|0;var f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;f=bp(e|0)|0;if((f|0)==0){g=-1;h=-1}else{i=-1;j=0;do{i=c[17704+(((d[e+j|0]|0)^i&255)<<2)>>2]^i>>>8;j=j+1|0;}while(j>>>0<f>>>0);g=i>>>16&65535;h=i&65535}b[1480]=h;b[1481]=g;b[1483]=0;b[1482]=0;a[2936]=0;a[2944]=0;a[2952]=0;g=a[e]|0;if(g<<24>>24==0){return}else{k=e;l=g;m=0;n=0;o=0;p=0;q=0}do{g=l&255;m=m+l&255;a[2952]=m;n=n^l;a[2944]=n;e=o+l&255;o=e<<1|(e&255)>>>7;a[2936]=o;e=c[17704+(g<<2)>>2]|0;p=(e^g^p&65535)&65535;b[1482]=p;q=(e>>>16)+g+(q&65535)&65535;b[1483]=q;k=k+1|0;l=a[k]|0;}while(l<<24>>24!=0);return}function bj(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0,P=0,Q=0,R=0,S=0,T=0,U=0,V=0,W=0,X=0,Y=0,Z=0,_=0,$=0,aa=0,ab=0,ac=0,ad=0,ae=0,af=0,ag=0,ah=0,ai=0,aj=0,ak=0,al=0,am=0,ao=0,ap=0,aq=0,ar=0,as=0,au=0,av=0,aw=0,ax=0,ay=0,az=0,aA=0,aB=0,aD=0,aE=0,aF=0,aH=0,aJ=0,aK=0,aL=0,aM=0,aN=0,aO=0;do{if(a>>>0<245){if(a>>>0<11){b=16}else{b=a+11&-8}d=b>>>3;e=c[210]|0;f=e>>>(d>>>0);if((f&3|0)!=0){g=(f&1^1)+d|0;h=g<<1;i=880+(h<<2)|0;j=880+(h+2<<2)|0;h=c[j>>2]|0;k=h+8|0;l=c[k>>2]|0;do{if((i|0)==(l|0)){c[210]=e&~(1<<g)}else{if(l>>>0<(c[214]|0)>>>0){an();return 0}m=l+12|0;if((c[m>>2]|0)==(h|0)){c[m>>2]=i;c[j>>2]=l;break}else{an();return 0}}}while(0);l=g<<3;c[h+4>>2]=l|3;j=h+(l|4)|0;c[j>>2]=c[j>>2]|1;n=k;return n|0}if(b>>>0<=(c[212]|0)>>>0){o=b;break}if((f|0)!=0){j=2<<d;l=f<<d&(j|-j);j=(l&-l)-1|0;l=j>>>12&16;i=j>>>(l>>>0);j=i>>>5&8;m=i>>>(j>>>0);i=m>>>2&4;p=m>>>(i>>>0);m=p>>>1&2;q=p>>>(m>>>0);p=q>>>1&1;r=(j|l|i|m|p)+(q>>>(p>>>0))|0;p=r<<1;q=880+(p<<2)|0;m=880+(p+2<<2)|0;p=c[m>>2]|0;i=p+8|0;l=c[i>>2]|0;do{if((q|0)==(l|0)){c[210]=e&~(1<<r)}else{if(l>>>0<(c[214]|0)>>>0){an();return 0}j=l+12|0;if((c[j>>2]|0)==(p|0)){c[j>>2]=q;c[m>>2]=l;break}else{an();return 0}}}while(0);l=r<<3;m=l-b|0;c[p+4>>2]=b|3;q=p;e=q+b|0;c[q+(b|4)>>2]=m|1;c[q+l>>2]=m;l=c[212]|0;if((l|0)!=0){q=c[215]|0;d=l>>>3;l=d<<1;f=880+(l<<2)|0;k=c[210]|0;h=1<<d;do{if((k&h|0)==0){c[210]=k|h;s=f;t=880+(l+2<<2)|0}else{d=880+(l+2<<2)|0;g=c[d>>2]|0;if(g>>>0>=(c[214]|0)>>>0){s=g;t=d;break}an();return 0}}while(0);c[t>>2]=q;c[s+12>>2]=q;c[q+8>>2]=s;c[q+12>>2]=f}c[212]=m;c[215]=e;n=i;return n|0}l=c[211]|0;if((l|0)==0){o=b;break}h=(l&-l)-1|0;l=h>>>12&16;k=h>>>(l>>>0);h=k>>>5&8;p=k>>>(h>>>0);k=p>>>2&4;r=p>>>(k>>>0);p=r>>>1&2;d=r>>>(p>>>0);r=d>>>1&1;g=c[1144+((h|l|k|p|r)+(d>>>(r>>>0))<<2)>>2]|0;r=g;d=g;p=(c[g+4>>2]&-8)-b|0;while(1){g=c[r+16>>2]|0;if((g|0)==0){k=c[r+20>>2]|0;if((k|0)==0){break}else{u=k}}else{u=g}g=(c[u+4>>2]&-8)-b|0;k=g>>>0<p>>>0;r=u;d=k?u:d;p=k?g:p}r=d;i=c[214]|0;if(r>>>0<i>>>0){an();return 0}e=r+b|0;m=e;if(r>>>0>=e>>>0){an();return 0}e=c[d+24>>2]|0;f=c[d+12>>2]|0;do{if((f|0)==(d|0)){q=d+20|0;g=c[q>>2]|0;if((g|0)==0){k=d+16|0;l=c[k>>2]|0;if((l|0)==0){v=0;break}else{w=l;x=k}}else{w=g;x=q}while(1){q=w+20|0;g=c[q>>2]|0;if((g|0)!=0){w=g;x=q;continue}q=w+16|0;g=c[q>>2]|0;if((g|0)==0){break}else{w=g;x=q}}if(x>>>0<i>>>0){an();return 0}else{c[x>>2]=0;v=w;break}}else{q=c[d+8>>2]|0;if(q>>>0<i>>>0){an();return 0}g=q+12|0;if((c[g>>2]|0)!=(d|0)){an();return 0}k=f+8|0;if((c[k>>2]|0)==(d|0)){c[g>>2]=f;c[k>>2]=q;v=f;break}else{an();return 0}}}while(0);L792:do{if((e|0)!=0){f=d+28|0;i=1144+(c[f>>2]<<2)|0;do{if((d|0)==(c[i>>2]|0)){c[i>>2]=v;if((v|0)!=0){break}c[211]=c[211]&~(1<<c[f>>2]);break L792}else{if(e>>>0<(c[214]|0)>>>0){an();return 0}q=e+16|0;if((c[q>>2]|0)==(d|0)){c[q>>2]=v}else{c[e+20>>2]=v}if((v|0)==0){break L792}}}while(0);if(v>>>0<(c[214]|0)>>>0){an();return 0}c[v+24>>2]=e;f=c[d+16>>2]|0;do{if((f|0)!=0){if(f>>>0<(c[214]|0)>>>0){an();return 0}else{c[v+16>>2]=f;c[f+24>>2]=v;break}}}while(0);f=c[d+20>>2]|0;if((f|0)==0){break}if(f>>>0<(c[214]|0)>>>0){an();return 0}else{c[v+20>>2]=f;c[f+24>>2]=v;break}}}while(0);if(p>>>0<16){e=p+b|0;c[d+4>>2]=e|3;f=r+(e+4)|0;c[f>>2]=c[f>>2]|1}else{c[d+4>>2]=b|3;c[r+(b|4)>>2]=p|1;c[r+(p+b)>>2]=p;f=c[212]|0;if((f|0)!=0){e=c[215]|0;i=f>>>3;f=i<<1;q=880+(f<<2)|0;k=c[210]|0;g=1<<i;do{if((k&g|0)==0){c[210]=k|g;y=q;z=880+(f+2<<2)|0}else{i=880+(f+2<<2)|0;l=c[i>>2]|0;if(l>>>0>=(c[214]|0)>>>0){y=l;z=i;break}an();return 0}}while(0);c[z>>2]=e;c[y+12>>2]=e;c[e+8>>2]=y;c[e+12>>2]=q}c[212]=p;c[215]=m}n=d+8|0;return n|0}else{if(a>>>0>4294967231){o=-1;break}f=a+11|0;g=f&-8;k=c[211]|0;if((k|0)==0){o=g;break}r=-g|0;i=f>>>8;do{if((i|0)==0){A=0}else{if(g>>>0>16777215){A=31;break}f=(i+1048320|0)>>>16&8;l=i<<f;h=(l+520192|0)>>>16&4;j=l<<h;l=(j+245760|0)>>>16&2;B=14-(h|f|l)+(j<<l>>>15)|0;A=g>>>((B+7|0)>>>0)&1|B<<1}}while(0);i=c[1144+(A<<2)>>2]|0;L599:do{if((i|0)==0){C=0;D=r;E=0}else{if((A|0)==31){F=0}else{F=25-(A>>>1)|0}d=0;m=r;p=i;q=g<<F;e=0;while(1){B=c[p+4>>2]&-8;l=B-g|0;if(l>>>0<m>>>0){if((B|0)==(g|0)){C=p;D=l;E=p;break L599}else{G=p;H=l}}else{G=d;H=m}l=c[p+20>>2]|0;B=c[p+16+(q>>>31<<2)>>2]|0;j=(l|0)==0|(l|0)==(B|0)?e:l;if((B|0)==0){C=G;D=H;E=j;break}else{d=G;m=H;p=B;q=q<<1;e=j}}}}while(0);if((E|0)==0&(C|0)==0){i=2<<A;r=k&(i|-i);if((r|0)==0){o=g;break}i=(r&-r)-1|0;r=i>>>12&16;e=i>>>(r>>>0);i=e>>>5&8;q=e>>>(i>>>0);e=q>>>2&4;p=q>>>(e>>>0);q=p>>>1&2;m=p>>>(q>>>0);p=m>>>1&1;I=c[1144+((i|r|e|q|p)+(m>>>(p>>>0))<<2)>>2]|0}else{I=E}if((I|0)==0){J=D;K=C}else{p=I;m=D;q=C;while(1){e=(c[p+4>>2]&-8)-g|0;r=e>>>0<m>>>0;i=r?e:m;e=r?p:q;r=c[p+16>>2]|0;if((r|0)!=0){p=r;m=i;q=e;continue}r=c[p+20>>2]|0;if((r|0)==0){J=i;K=e;break}else{p=r;m=i;q=e}}}if((K|0)==0){o=g;break}if(J>>>0>=((c[212]|0)-g|0)>>>0){o=g;break}q=K;m=c[214]|0;if(q>>>0<m>>>0){an();return 0}p=q+g|0;k=p;if(q>>>0>=p>>>0){an();return 0}e=c[K+24>>2]|0;i=c[K+12>>2]|0;do{if((i|0)==(K|0)){r=K+20|0;d=c[r>>2]|0;if((d|0)==0){j=K+16|0;B=c[j>>2]|0;if((B|0)==0){L=0;break}else{M=B;N=j}}else{M=d;N=r}while(1){r=M+20|0;d=c[r>>2]|0;if((d|0)!=0){M=d;N=r;continue}r=M+16|0;d=c[r>>2]|0;if((d|0)==0){break}else{M=d;N=r}}if(N>>>0<m>>>0){an();return 0}else{c[N>>2]=0;L=M;break}}else{r=c[K+8>>2]|0;if(r>>>0<m>>>0){an();return 0}d=r+12|0;if((c[d>>2]|0)!=(K|0)){an();return 0}j=i+8|0;if((c[j>>2]|0)==(K|0)){c[d>>2]=i;c[j>>2]=r;L=i;break}else{an();return 0}}}while(0);L649:do{if((e|0)!=0){i=K+28|0;m=1144+(c[i>>2]<<2)|0;do{if((K|0)==(c[m>>2]|0)){c[m>>2]=L;if((L|0)!=0){break}c[211]=c[211]&~(1<<c[i>>2]);break L649}else{if(e>>>0<(c[214]|0)>>>0){an();return 0}r=e+16|0;if((c[r>>2]|0)==(K|0)){c[r>>2]=L}else{c[e+20>>2]=L}if((L|0)==0){break L649}}}while(0);if(L>>>0<(c[214]|0)>>>0){an();return 0}c[L+24>>2]=e;i=c[K+16>>2]|0;do{if((i|0)!=0){if(i>>>0<(c[214]|0)>>>0){an();return 0}else{c[L+16>>2]=i;c[i+24>>2]=L;break}}}while(0);i=c[K+20>>2]|0;if((i|0)==0){break}if(i>>>0<(c[214]|0)>>>0){an();return 0}else{c[L+20>>2]=i;c[i+24>>2]=L;break}}}while(0);L677:do{if(J>>>0<16){e=J+g|0;c[K+4>>2]=e|3;i=q+(e+4)|0;c[i>>2]=c[i>>2]|1}else{c[K+4>>2]=g|3;c[q+(g|4)>>2]=J|1;c[q+(J+g)>>2]=J;i=J>>>3;if(J>>>0<256){e=i<<1;m=880+(e<<2)|0;r=c[210]|0;j=1<<i;do{if((r&j|0)==0){c[210]=r|j;O=m;P=880+(e+2<<2)|0}else{i=880+(e+2<<2)|0;d=c[i>>2]|0;if(d>>>0>=(c[214]|0)>>>0){O=d;P=i;break}an();return 0}}while(0);c[P>>2]=k;c[O+12>>2]=k;c[q+(g+8)>>2]=O;c[q+(g+12)>>2]=m;break}e=p;j=J>>>8;do{if((j|0)==0){Q=0}else{if(J>>>0>16777215){Q=31;break}r=(j+1048320|0)>>>16&8;i=j<<r;d=(i+520192|0)>>>16&4;B=i<<d;i=(B+245760|0)>>>16&2;l=14-(d|r|i)+(B<<i>>>15)|0;Q=J>>>((l+7|0)>>>0)&1|l<<1}}while(0);j=1144+(Q<<2)|0;c[q+(g+28)>>2]=Q;c[q+(g+20)>>2]=0;c[q+(g+16)>>2]=0;m=c[211]|0;l=1<<Q;if((m&l|0)==0){c[211]=m|l;c[j>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break}l=c[j>>2]|0;if((Q|0)==31){R=0}else{R=25-(Q>>>1)|0}L698:do{if((c[l+4>>2]&-8|0)==(J|0)){S=l}else{j=l;m=J<<R;while(1){T=j+16+(m>>>31<<2)|0;i=c[T>>2]|0;if((i|0)==0){break}if((c[i+4>>2]&-8|0)==(J|0)){S=i;break L698}else{j=i;m=m<<1}}if(T>>>0<(c[214]|0)>>>0){an();return 0}else{c[T>>2]=e;c[q+(g+24)>>2]=j;c[q+(g+12)>>2]=e;c[q+(g+8)>>2]=e;break L677}}}while(0);l=S+8|0;m=c[l>>2]|0;i=c[214]|0;if(S>>>0<i>>>0){an();return 0}if(m>>>0<i>>>0){an();return 0}else{c[m+12>>2]=e;c[l>>2]=e;c[q+(g+8)>>2]=m;c[q+(g+12)>>2]=S;c[q+(g+24)>>2]=0;break}}}while(0);n=K+8|0;return n|0}}while(0);K=c[212]|0;if(o>>>0<=K>>>0){S=K-o|0;T=c[215]|0;if(S>>>0>15){J=T;c[215]=J+o;c[212]=S;c[J+(o+4)>>2]=S|1;c[J+K>>2]=S;c[T+4>>2]=o|3}else{c[212]=0;c[215]=0;c[T+4>>2]=K|3;S=T+(K+4)|0;c[S>>2]=c[S>>2]|1}n=T+8|0;return n|0}T=c[213]|0;if(o>>>0<T>>>0){S=T-o|0;c[213]=S;T=c[216]|0;K=T;c[216]=K+o;c[K+(o+4)>>2]=S|1;c[T+4>>2]=o|3;n=T+8|0;return n|0}do{if((c[194]|0)==0){T=at(8)|0;if((T-1&T|0)==0){c[196]=T;c[195]=T;c[197]=-1;c[198]=2097152;c[199]=0;c[321]=0;c[194]=(aC(0)|0)&-16^1431655768;break}else{an();return 0}}}while(0);T=o+48|0;S=c[196]|0;K=o+47|0;J=S+K|0;R=-S|0;S=J&R;if(S>>>0<=o>>>0){n=0;return n|0}Q=c[320]|0;do{if((Q|0)!=0){O=c[318]|0;P=O+S|0;if(P>>>0<=O>>>0|P>>>0>Q>>>0){n=0}else{break}return n|0}}while(0);L859:do{if((c[321]&4|0)==0){Q=c[216]|0;L861:do{if((Q|0)==0){U=606}else{P=Q;O=1288;while(1){V=O|0;L=c[V>>2]|0;if(L>>>0<=P>>>0){W=O+4|0;if((L+(c[W>>2]|0)|0)>>>0>P>>>0){break}}L=c[O+8>>2]|0;if((L|0)==0){U=606;break L861}else{O=L}}if((O|0)==0){U=606;break}P=J-(c[213]|0)&R;if(P>>>0>=2147483647){X=0;break}e=aG(P|0)|0;L=(e|0)==((c[V>>2]|0)+(c[W>>2]|0)|0);Y=L?e:-1;Z=L?P:0;_=e;$=P;U=615}}while(0);do{if((U|0)==606){Q=aG(0)|0;if((Q|0)==-1){X=0;break}P=Q;e=c[195]|0;L=e-1|0;if((L&P|0)==0){aa=S}else{aa=S-P+(L+P&-e)|0}e=c[318]|0;P=e+aa|0;if(!(aa>>>0>o>>>0&aa>>>0<2147483647)){X=0;break}L=c[320]|0;if((L|0)!=0){if(P>>>0<=e>>>0|P>>>0>L>>>0){X=0;break}}L=aG(aa|0)|0;P=(L|0)==(Q|0);Y=P?Q:-1;Z=P?aa:0;_=L;$=aa;U=615}}while(0);L881:do{if((U|0)==615){L=-$|0;if((Y|0)!=-1){ab=Z;ac=Y;U=626;break L859}do{if((_|0)!=-1&$>>>0<2147483647&$>>>0<T>>>0){P=c[196]|0;Q=K-$+P&-P;if(Q>>>0>=2147483647){ad=$;break}if((aG(Q|0)|0)==-1){aG(L|0)|0;X=Z;break L881}else{ad=Q+$|0;break}}else{ad=$}}while(0);if((_|0)==-1){X=Z}else{ab=ad;ac=_;U=626;break L859}}}while(0);c[321]=c[321]|4;ae=X;U=623}else{ae=0;U=623}}while(0);do{if((U|0)==623){if(S>>>0>=2147483647){break}X=aG(S|0)|0;_=aG(0)|0;if(!((_|0)!=-1&(X|0)!=-1&X>>>0<_>>>0)){break}ad=_-X|0;_=ad>>>0>(o+40|0)>>>0;if(_){ab=_?ad:ae;ac=X;U=626}}}while(0);do{if((U|0)==626){ae=(c[318]|0)+ab|0;c[318]=ae;if(ae>>>0>(c[319]|0)>>>0){c[319]=ae}ae=c[216]|0;L901:do{if((ae|0)==0){S=c[214]|0;if((S|0)==0|ac>>>0<S>>>0){c[214]=ac}c[322]=ac;c[323]=ab;c[325]=0;c[219]=c[194];c[218]=-1;S=0;do{X=S<<1;ad=880+(X<<2)|0;c[880+(X+3<<2)>>2]=ad;c[880+(X+2<<2)>>2]=ad;S=S+1|0;}while(S>>>0<32);S=ac+8|0;if((S&7|0)==0){af=0}else{af=-S&7}S=ab-40-af|0;c[216]=ac+af;c[213]=S;c[ac+(af+4)>>2]=S|1;c[ac+(ab-36)>>2]=40;c[217]=c[198]}else{S=1288;while(1){ag=c[S>>2]|0;ah=S+4|0;ai=c[ah>>2]|0;if((ac|0)==(ag+ai|0)){U=638;break}ad=c[S+8>>2]|0;if((ad|0)==0){break}else{S=ad}}do{if((U|0)==638){if((c[S+12>>2]&8|0)!=0){break}ad=ae;if(!(ad>>>0>=ag>>>0&ad>>>0<ac>>>0)){break}c[ah>>2]=ai+ab;ad=c[216]|0;X=(c[213]|0)+ab|0;_=ad;Z=ad+8|0;if((Z&7|0)==0){aj=0}else{aj=-Z&7}Z=X-aj|0;c[216]=_+aj;c[213]=Z;c[_+(aj+4)>>2]=Z|1;c[_+(X+4)>>2]=40;c[217]=c[198];break L901}}while(0);if(ac>>>0<(c[214]|0)>>>0){c[214]=ac}S=ac+ab|0;X=1288;while(1){ak=X|0;if((c[ak>>2]|0)==(S|0)){U=648;break}_=c[X+8>>2]|0;if((_|0)==0){break}else{X=_}}do{if((U|0)==648){if((c[X+12>>2]&8|0)!=0){break}c[ak>>2]=ac;S=X+4|0;c[S>>2]=(c[S>>2]|0)+ab;S=ac+8|0;if((S&7|0)==0){al=0}else{al=-S&7}S=ac+(ab+8)|0;if((S&7|0)==0){am=0}else{am=-S&7}S=ac+(am+ab)|0;_=S;Z=al+o|0;ad=ac+Z|0;$=ad;K=S-(ac+al)-o|0;c[ac+(al+4)>>2]=o|3;L938:do{if((_|0)==(c[216]|0)){T=(c[213]|0)+K|0;c[213]=T;c[216]=$;c[ac+(Z+4)>>2]=T|1}else{if((_|0)==(c[215]|0)){T=(c[212]|0)+K|0;c[212]=T;c[215]=$;c[ac+(Z+4)>>2]=T|1;c[ac+(T+Z)>>2]=T;break}T=ab+4|0;Y=c[ac+(T+am)>>2]|0;if((Y&3|0)==1){aa=Y&-8;W=Y>>>3;L946:do{if(Y>>>0<256){V=c[ac+((am|8)+ab)>>2]|0;R=c[ac+(ab+12+am)>>2]|0;J=880+(W<<1<<2)|0;do{if((V|0)!=(J|0)){if(V>>>0<(c[214]|0)>>>0){an();return 0}if((c[V+12>>2]|0)==(_|0)){break}an();return 0}}while(0);if((R|0)==(V|0)){c[210]=c[210]&~(1<<W);break}do{if((R|0)==(J|0)){ao=R+8|0}else{if(R>>>0<(c[214]|0)>>>0){an();return 0}L=R+8|0;if((c[L>>2]|0)==(_|0)){ao=L;break}an();return 0}}while(0);c[V+12>>2]=R;c[ao>>2]=V}else{J=S;L=c[ac+((am|24)+ab)>>2]|0;O=c[ac+(ab+12+am)>>2]|0;do{if((O|0)==(J|0)){Q=am|16;P=ac+(T+Q)|0;e=c[P>>2]|0;if((e|0)==0){M=ac+(Q+ab)|0;Q=c[M>>2]|0;if((Q|0)==0){ap=0;break}else{aq=Q;ar=M}}else{aq=e;ar=P}while(1){P=aq+20|0;e=c[P>>2]|0;if((e|0)!=0){aq=e;ar=P;continue}P=aq+16|0;e=c[P>>2]|0;if((e|0)==0){break}else{aq=e;ar=P}}if(ar>>>0<(c[214]|0)>>>0){an();return 0}else{c[ar>>2]=0;ap=aq;break}}else{P=c[ac+((am|8)+ab)>>2]|0;if(P>>>0<(c[214]|0)>>>0){an();return 0}e=P+12|0;if((c[e>>2]|0)!=(J|0)){an();return 0}M=O+8|0;if((c[M>>2]|0)==(J|0)){c[e>>2]=O;c[M>>2]=P;ap=O;break}else{an();return 0}}}while(0);if((L|0)==0){break}O=ac+(ab+28+am)|0;V=1144+(c[O>>2]<<2)|0;do{if((J|0)==(c[V>>2]|0)){c[V>>2]=ap;if((ap|0)!=0){break}c[211]=c[211]&~(1<<c[O>>2]);break L946}else{if(L>>>0<(c[214]|0)>>>0){an();return 0}R=L+16|0;if((c[R>>2]|0)==(J|0)){c[R>>2]=ap}else{c[L+20>>2]=ap}if((ap|0)==0){break L946}}}while(0);if(ap>>>0<(c[214]|0)>>>0){an();return 0}c[ap+24>>2]=L;J=am|16;O=c[ac+(J+ab)>>2]|0;do{if((O|0)!=0){if(O>>>0<(c[214]|0)>>>0){an();return 0}else{c[ap+16>>2]=O;c[O+24>>2]=ap;break}}}while(0);O=c[ac+(T+J)>>2]|0;if((O|0)==0){break}if(O>>>0<(c[214]|0)>>>0){an();return 0}else{c[ap+20>>2]=O;c[O+24>>2]=ap;break}}}while(0);as=ac+((aa|am)+ab)|0;au=aa+K|0}else{as=_;au=K}T=as+4|0;c[T>>2]=c[T>>2]&-2;c[ac+(Z+4)>>2]=au|1;c[ac+(au+Z)>>2]=au;T=au>>>3;if(au>>>0<256){W=T<<1;Y=880+(W<<2)|0;O=c[210]|0;L=1<<T;do{if((O&L|0)==0){c[210]=O|L;av=Y;aw=880+(W+2<<2)|0}else{T=880+(W+2<<2)|0;V=c[T>>2]|0;if(V>>>0>=(c[214]|0)>>>0){av=V;aw=T;break}an();return 0}}while(0);c[aw>>2]=$;c[av+12>>2]=$;c[ac+(Z+8)>>2]=av;c[ac+(Z+12)>>2]=Y;break}W=ad;L=au>>>8;do{if((L|0)==0){ax=0}else{if(au>>>0>16777215){ax=31;break}O=(L+1048320|0)>>>16&8;aa=L<<O;T=(aa+520192|0)>>>16&4;V=aa<<T;aa=(V+245760|0)>>>16&2;R=14-(T|O|aa)+(V<<aa>>>15)|0;ax=au>>>((R+7|0)>>>0)&1|R<<1}}while(0);L=1144+(ax<<2)|0;c[ac+(Z+28)>>2]=ax;c[ac+(Z+20)>>2]=0;c[ac+(Z+16)>>2]=0;Y=c[211]|0;R=1<<ax;if((Y&R|0)==0){c[211]=Y|R;c[L>>2]=W;c[ac+(Z+24)>>2]=L;c[ac+(Z+12)>>2]=W;c[ac+(Z+8)>>2]=W;break}R=c[L>>2]|0;if((ax|0)==31){ay=0}else{ay=25-(ax>>>1)|0}L1035:do{if((c[R+4>>2]&-8|0)==(au|0)){az=R}else{L=R;Y=au<<ay;while(1){aA=L+16+(Y>>>31<<2)|0;aa=c[aA>>2]|0;if((aa|0)==0){break}if((c[aa+4>>2]&-8|0)==(au|0)){az=aa;break L1035}else{L=aa;Y=Y<<1}}if(aA>>>0<(c[214]|0)>>>0){an();return 0}else{c[aA>>2]=W;c[ac+(Z+24)>>2]=L;c[ac+(Z+12)>>2]=W;c[ac+(Z+8)>>2]=W;break L938}}}while(0);R=az+8|0;Y=c[R>>2]|0;J=c[214]|0;if(az>>>0<J>>>0){an();return 0}if(Y>>>0<J>>>0){an();return 0}else{c[Y+12>>2]=W;c[R>>2]=W;c[ac+(Z+8)>>2]=Y;c[ac+(Z+12)>>2]=az;c[ac+(Z+24)>>2]=0;break}}}while(0);n=ac+(al|8)|0;return n|0}}while(0);X=ae;Z=1288;while(1){aB=c[Z>>2]|0;if(aB>>>0<=X>>>0){aD=c[Z+4>>2]|0;aE=aB+aD|0;if(aE>>>0>X>>>0){break}}Z=c[Z+8>>2]|0}Z=aB+(aD-39)|0;if((Z&7|0)==0){aF=0}else{aF=-Z&7}Z=aB+(aD-47+aF)|0;ad=Z>>>0<(ae+16|0)>>>0?X:Z;Z=ad+8|0;$=ac+8|0;if(($&7|0)==0){aH=0}else{aH=-$&7}$=ab-40-aH|0;c[216]=ac+aH;c[213]=$;c[ac+(aH+4)>>2]=$|1;c[ac+(ab-36)>>2]=40;c[217]=c[198];c[ad+4>>2]=27;c[Z>>2]=c[322];c[Z+4>>2]=c[1292>>2];c[Z+8>>2]=c[1296>>2];c[Z+12>>2]=c[1300>>2];c[322]=ac;c[323]=ab;c[325]=0;c[324]=Z;Z=ad+28|0;c[Z>>2]=7;if((ad+32|0)>>>0<aE>>>0){$=Z;while(1){Z=$+4|0;c[Z>>2]=7;if(($+8|0)>>>0<aE>>>0){$=Z}else{break}}}if((ad|0)==(X|0)){break}$=ad-ae|0;Z=X+($+4)|0;c[Z>>2]=c[Z>>2]&-2;c[ae+4>>2]=$|1;c[X+$>>2]=$;Z=$>>>3;if($>>>0<256){K=Z<<1;_=880+(K<<2)|0;S=c[210]|0;j=1<<Z;do{if((S&j|0)==0){c[210]=S|j;aJ=_;aK=880+(K+2<<2)|0}else{Z=880+(K+2<<2)|0;Y=c[Z>>2]|0;if(Y>>>0>=(c[214]|0)>>>0){aJ=Y;aK=Z;break}an();return 0}}while(0);c[aK>>2]=ae;c[aJ+12>>2]=ae;c[ae+8>>2]=aJ;c[ae+12>>2]=_;break}K=ae;j=$>>>8;do{if((j|0)==0){aL=0}else{if($>>>0>16777215){aL=31;break}S=(j+1048320|0)>>>16&8;X=j<<S;ad=(X+520192|0)>>>16&4;Z=X<<ad;X=(Z+245760|0)>>>16&2;Y=14-(ad|S|X)+(Z<<X>>>15)|0;aL=$>>>((Y+7|0)>>>0)&1|Y<<1}}while(0);j=1144+(aL<<2)|0;c[ae+28>>2]=aL;c[ae+20>>2]=0;c[ae+16>>2]=0;_=c[211]|0;Y=1<<aL;if((_&Y|0)==0){c[211]=_|Y;c[j>>2]=K;c[ae+24>>2]=j;c[ae+12>>2]=ae;c[ae+8>>2]=ae;break}Y=c[j>>2]|0;if((aL|0)==31){aM=0}else{aM=25-(aL>>>1)|0}L1089:do{if((c[Y+4>>2]&-8|0)==($|0)){aN=Y}else{j=Y;_=$<<aM;while(1){aO=j+16+(_>>>31<<2)|0;X=c[aO>>2]|0;if((X|0)==0){break}if((c[X+4>>2]&-8|0)==($|0)){aN=X;break L1089}else{j=X;_=_<<1}}if(aO>>>0<(c[214]|0)>>>0){an();return 0}else{c[aO>>2]=K;c[ae+24>>2]=j;c[ae+12>>2]=ae;c[ae+8>>2]=ae;break L901}}}while(0);$=aN+8|0;Y=c[$>>2]|0;_=c[214]|0;if(aN>>>0<_>>>0){an();return 0}if(Y>>>0<_>>>0){an();return 0}else{c[Y+12>>2]=K;c[$>>2]=K;c[ae+8>>2]=Y;c[ae+12>>2]=aN;c[ae+24>>2]=0;break}}}while(0);ae=c[213]|0;if(ae>>>0<=o>>>0){break}Y=ae-o|0;c[213]=Y;ae=c[216]|0;$=ae;c[216]=$+o;c[$+(o+4)>>2]=Y|1;c[ae+4>>2]=o|3;n=ae+8|0;return n|0}}while(0);c[(aI()|0)>>2]=12;n=0;return n|0}function bk(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0,M=0,N=0,O=0;if((a|0)==0){return}b=a-8|0;d=b;e=c[214]|0;if(b>>>0<e>>>0){an()}f=c[a-4>>2]|0;g=f&3;if((g|0)==1){an()}h=f&-8;i=a+(h-8)|0;j=i;L1120:do{if((f&1|0)==0){k=c[b>>2]|0;if((g|0)==0){return}l=-8-k|0;m=a+l|0;n=m;o=k+h|0;if(m>>>0<e>>>0){an()}if((n|0)==(c[215]|0)){p=a+(h-4)|0;if((c[p>>2]&3|0)!=3){q=n;r=o;break}c[212]=o;c[p>>2]=c[p>>2]&-2;c[a+(l+4)>>2]=o|1;c[i>>2]=o;return}p=k>>>3;if(k>>>0<256){k=c[a+(l+8)>>2]|0;s=c[a+(l+12)>>2]|0;t=880+(p<<1<<2)|0;do{if((k|0)!=(t|0)){if(k>>>0<e>>>0){an()}if((c[k+12>>2]|0)==(n|0)){break}an()}}while(0);if((s|0)==(k|0)){c[210]=c[210]&~(1<<p);q=n;r=o;break}do{if((s|0)==(t|0)){u=s+8|0}else{if(s>>>0<e>>>0){an()}v=s+8|0;if((c[v>>2]|0)==(n|0)){u=v;break}an()}}while(0);c[k+12>>2]=s;c[u>>2]=k;q=n;r=o;break}t=m;p=c[a+(l+24)>>2]|0;v=c[a+(l+12)>>2]|0;do{if((v|0)==(t|0)){w=a+(l+20)|0;x=c[w>>2]|0;if((x|0)==0){y=a+(l+16)|0;z=c[y>>2]|0;if((z|0)==0){A=0;break}else{B=z;C=y}}else{B=x;C=w}while(1){w=B+20|0;x=c[w>>2]|0;if((x|0)!=0){B=x;C=w;continue}w=B+16|0;x=c[w>>2]|0;if((x|0)==0){break}else{B=x;C=w}}if(C>>>0<e>>>0){an()}else{c[C>>2]=0;A=B;break}}else{w=c[a+(l+8)>>2]|0;if(w>>>0<e>>>0){an()}x=w+12|0;if((c[x>>2]|0)!=(t|0)){an()}y=v+8|0;if((c[y>>2]|0)==(t|0)){c[x>>2]=v;c[y>>2]=w;A=v;break}else{an()}}}while(0);if((p|0)==0){q=n;r=o;break}v=a+(l+28)|0;m=1144+(c[v>>2]<<2)|0;do{if((t|0)==(c[m>>2]|0)){c[m>>2]=A;if((A|0)!=0){break}c[211]=c[211]&~(1<<c[v>>2]);q=n;r=o;break L1120}else{if(p>>>0<(c[214]|0)>>>0){an()}k=p+16|0;if((c[k>>2]|0)==(t|0)){c[k>>2]=A}else{c[p+20>>2]=A}if((A|0)==0){q=n;r=o;break L1120}}}while(0);if(A>>>0<(c[214]|0)>>>0){an()}c[A+24>>2]=p;t=c[a+(l+16)>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[214]|0)>>>0){an()}else{c[A+16>>2]=t;c[t+24>>2]=A;break}}}while(0);t=c[a+(l+20)>>2]|0;if((t|0)==0){q=n;r=o;break}if(t>>>0<(c[214]|0)>>>0){an()}else{c[A+20>>2]=t;c[t+24>>2]=A;q=n;r=o;break}}else{q=d;r=h}}while(0);d=q;if(d>>>0>=i>>>0){an()}A=a+(h-4)|0;e=c[A>>2]|0;if((e&1|0)==0){an()}do{if((e&2|0)==0){if((j|0)==(c[216]|0)){B=(c[213]|0)+r|0;c[213]=B;c[216]=q;c[q+4>>2]=B|1;if((q|0)==(c[215]|0)){c[215]=0;c[212]=0}if(B>>>0<=(c[217]|0)>>>0){return}bm(0)|0;return}if((j|0)==(c[215]|0)){B=(c[212]|0)+r|0;c[212]=B;c[215]=q;c[q+4>>2]=B|1;c[d+B>>2]=B;return}B=(e&-8)+r|0;C=e>>>3;L1225:do{if(e>>>0<256){u=c[a+h>>2]|0;g=c[a+(h|4)>>2]|0;b=880+(C<<1<<2)|0;do{if((u|0)!=(b|0)){if(u>>>0<(c[214]|0)>>>0){an()}if((c[u+12>>2]|0)==(j|0)){break}an()}}while(0);if((g|0)==(u|0)){c[210]=c[210]&~(1<<C);break}do{if((g|0)==(b|0)){D=g+8|0}else{if(g>>>0<(c[214]|0)>>>0){an()}f=g+8|0;if((c[f>>2]|0)==(j|0)){D=f;break}an()}}while(0);c[u+12>>2]=g;c[D>>2]=u}else{b=i;f=c[a+(h+16)>>2]|0;t=c[a+(h|4)>>2]|0;do{if((t|0)==(b|0)){p=a+(h+12)|0;v=c[p>>2]|0;if((v|0)==0){m=a+(h+8)|0;k=c[m>>2]|0;if((k|0)==0){E=0;break}else{F=k;G=m}}else{F=v;G=p}while(1){p=F+20|0;v=c[p>>2]|0;if((v|0)!=0){F=v;G=p;continue}p=F+16|0;v=c[p>>2]|0;if((v|0)==0){break}else{F=v;G=p}}if(G>>>0<(c[214]|0)>>>0){an()}else{c[G>>2]=0;E=F;break}}else{p=c[a+h>>2]|0;if(p>>>0<(c[214]|0)>>>0){an()}v=p+12|0;if((c[v>>2]|0)!=(b|0)){an()}m=t+8|0;if((c[m>>2]|0)==(b|0)){c[v>>2]=t;c[m>>2]=p;E=t;break}else{an()}}}while(0);if((f|0)==0){break}t=a+(h+20)|0;u=1144+(c[t>>2]<<2)|0;do{if((b|0)==(c[u>>2]|0)){c[u>>2]=E;if((E|0)!=0){break}c[211]=c[211]&~(1<<c[t>>2]);break L1225}else{if(f>>>0<(c[214]|0)>>>0){an()}g=f+16|0;if((c[g>>2]|0)==(b|0)){c[g>>2]=E}else{c[f+20>>2]=E}if((E|0)==0){break L1225}}}while(0);if(E>>>0<(c[214]|0)>>>0){an()}c[E+24>>2]=f;b=c[a+(h+8)>>2]|0;do{if((b|0)!=0){if(b>>>0<(c[214]|0)>>>0){an()}else{c[E+16>>2]=b;c[b+24>>2]=E;break}}}while(0);b=c[a+(h+12)>>2]|0;if((b|0)==0){break}if(b>>>0<(c[214]|0)>>>0){an()}else{c[E+20>>2]=b;c[b+24>>2]=E;break}}}while(0);c[q+4>>2]=B|1;c[d+B>>2]=B;if((q|0)!=(c[215]|0)){H=B;break}c[212]=B;return}else{c[A>>2]=e&-2;c[q+4>>2]=r|1;c[d+r>>2]=r;H=r}}while(0);r=H>>>3;if(H>>>0<256){d=r<<1;e=880+(d<<2)|0;A=c[210]|0;E=1<<r;do{if((A&E|0)==0){c[210]=A|E;I=e;J=880+(d+2<<2)|0}else{r=880+(d+2<<2)|0;h=c[r>>2]|0;if(h>>>0>=(c[214]|0)>>>0){I=h;J=r;break}an()}}while(0);c[J>>2]=q;c[I+12>>2]=q;c[q+8>>2]=I;c[q+12>>2]=e;return}e=q;I=H>>>8;do{if((I|0)==0){K=0}else{if(H>>>0>16777215){K=31;break}J=(I+1048320|0)>>>16&8;d=I<<J;E=(d+520192|0)>>>16&4;A=d<<E;d=(A+245760|0)>>>16&2;r=14-(E|J|d)+(A<<d>>>15)|0;K=H>>>((r+7|0)>>>0)&1|r<<1}}while(0);I=1144+(K<<2)|0;c[q+28>>2]=K;c[q+20>>2]=0;c[q+16>>2]=0;r=c[211]|0;d=1<<K;L1312:do{if((r&d|0)==0){c[211]=r|d;c[I>>2]=e;c[q+24>>2]=I;c[q+12>>2]=q;c[q+8>>2]=q}else{A=c[I>>2]|0;if((K|0)==31){L=0}else{L=25-(K>>>1)|0}L1318:do{if((c[A+4>>2]&-8|0)==(H|0)){M=A}else{J=A;E=H<<L;while(1){N=J+16+(E>>>31<<2)|0;h=c[N>>2]|0;if((h|0)==0){break}if((c[h+4>>2]&-8|0)==(H|0)){M=h;break L1318}else{J=h;E=E<<1}}if(N>>>0<(c[214]|0)>>>0){an()}else{c[N>>2]=e;c[q+24>>2]=J;c[q+12>>2]=q;c[q+8>>2]=q;break L1312}}}while(0);A=M+8|0;B=c[A>>2]|0;E=c[214]|0;if(M>>>0<E>>>0){an()}if(B>>>0<E>>>0){an()}else{c[B+12>>2]=e;c[A>>2]=e;c[q+8>>2]=B;c[q+12>>2]=M;c[q+24>>2]=0;break}}}while(0);q=(c[218]|0)-1|0;c[218]=q;if((q|0)==0){O=1296}else{return}while(1){q=c[O>>2]|0;if((q|0)==0){break}else{O=q+8|0}}c[218]=-1;return}function bl(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0;if((a|0)==0){d=bj(b)|0;return d|0}if(b>>>0>4294967231){c[(aI()|0)>>2]=12;d=0;return d|0}if(b>>>0<11){e=16}else{e=b+11&-8}f=bn(a-8|0,e)|0;if((f|0)!=0){d=f+8|0;return d|0}f=bj(b)|0;if((f|0)==0){d=0;return d|0}e=c[a-4>>2]|0;g=(e&-8)-((e&3|0)==0?8:4)|0;e=g>>>0<b>>>0?g:b;br(f|0,a|0,e)|0;bk(a);d=f;return d|0}function bm(a){a=a|0;var b=0,d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0;do{if((c[194]|0)==0){b=at(8)|0;if((b-1&b|0)==0){c[196]=b;c[195]=b;c[197]=-1;c[198]=2097152;c[199]=0;c[321]=0;c[194]=(aC(0)|0)&-16^1431655768;break}else{an();return 0}}}while(0);if(a>>>0>=4294967232){d=0;return d|0}b=c[216]|0;if((b|0)==0){d=0;return d|0}e=c[213]|0;do{if(e>>>0>(a+40|0)>>>0){f=c[196]|0;g=(((-40-a-1+e+f|0)>>>0)/(f>>>0)|0)-1|0;h=b;i=1288;while(1){j=i|0;k=c[j>>2]|0;if(k>>>0<=h>>>0){l=i+4|0;if((k+(c[l>>2]|0)|0)>>>0>h>>>0){break}}i=c[i+8>>2]|0}h=_(g,f)|0;if((c[i+12>>2]&8|0)!=0){break}k=aG(0)|0;if((k|0)!=((c[j>>2]|0)+(c[l>>2]|0)|0)){break}m=aG(-(h>>>0>2147483646?-2147483648-f|0:h)|0)|0;h=aG(0)|0;if(!((m|0)!=-1&h>>>0<k>>>0)){break}m=k-h|0;if((k|0)==(h|0)){break}c[l>>2]=(c[l>>2]|0)-m;c[318]=(c[318]|0)-m;n=c[216]|0;o=(c[213]|0)-m|0;m=n;p=n+8|0;if((p&7|0)==0){q=0}else{q=-p&7}p=o-q|0;c[216]=m+q;c[213]=p;c[m+(q+4)>>2]=p|1;c[m+(o+4)>>2]=40;c[217]=c[198];d=(k|0)!=(h|0)|0;return d|0}}while(0);if((c[213]|0)>>>0<=(c[217]|0)>>>0){d=0;return d|0}c[217]=-1;d=0;return d|0}function bn(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0;d=a+4|0;e=c[d>>2]|0;f=e&-8;g=a;h=g+f|0;i=h;j=c[214]|0;if(g>>>0<j>>>0){an();return 0}k=e&3;if(!((k|0)!=1&g>>>0<h>>>0)){an();return 0}l=g+(f|4)|0;m=c[l>>2]|0;if((m&1|0)==0){an();return 0}if((k|0)==0){if(b>>>0<256){n=0;return n|0}do{if(f>>>0>=(b+4|0)>>>0){if((f-b|0)>>>0>c[196]<<1>>>0){break}else{n=a}return n|0}}while(0);n=0;return n|0}if(f>>>0>=b>>>0){k=f-b|0;if(k>>>0<=15){n=a;return n|0}c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|3;c[l>>2]=c[l>>2]|1;bo(g+b|0,k);n=a;return n|0}if((i|0)==(c[216]|0)){k=(c[213]|0)+f|0;if(k>>>0<=b>>>0){n=0;return n|0}l=k-b|0;c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=l|1;c[216]=g+b;c[213]=l;n=a;return n|0}if((i|0)==(c[215]|0)){l=(c[212]|0)+f|0;if(l>>>0<b>>>0){n=0;return n|0}k=l-b|0;if(k>>>0>15){c[d>>2]=e&1|b|2;c[g+(b+4)>>2]=k|1;c[g+l>>2]=k;o=g+(l+4)|0;c[o>>2]=c[o>>2]&-2;p=g+b|0;q=k}else{c[d>>2]=e&1|l|2;e=g+(l+4)|0;c[e>>2]=c[e>>2]|1;p=0;q=0}c[212]=q;c[215]=p;n=a;return n|0}if((m&2|0)!=0){n=0;return n|0}p=(m&-8)+f|0;if(p>>>0<b>>>0){n=0;return n|0}q=p-b|0;e=m>>>3;L1447:do{if(m>>>0<256){l=c[g+(f+8)>>2]|0;k=c[g+(f+12)>>2]|0;o=880+(e<<1<<2)|0;do{if((l|0)!=(o|0)){if(l>>>0<j>>>0){an();return 0}if((c[l+12>>2]|0)==(i|0)){break}an();return 0}}while(0);if((k|0)==(l|0)){c[210]=c[210]&~(1<<e);break}do{if((k|0)==(o|0)){r=k+8|0}else{if(k>>>0<j>>>0){an();return 0}s=k+8|0;if((c[s>>2]|0)==(i|0)){r=s;break}an();return 0}}while(0);c[l+12>>2]=k;c[r>>2]=l}else{o=h;s=c[g+(f+24)>>2]|0;t=c[g+(f+12)>>2]|0;do{if((t|0)==(o|0)){u=g+(f+20)|0;v=c[u>>2]|0;if((v|0)==0){w=g+(f+16)|0;x=c[w>>2]|0;if((x|0)==0){y=0;break}else{z=x;A=w}}else{z=v;A=u}while(1){u=z+20|0;v=c[u>>2]|0;if((v|0)!=0){z=v;A=u;continue}u=z+16|0;v=c[u>>2]|0;if((v|0)==0){break}else{z=v;A=u}}if(A>>>0<j>>>0){an();return 0}else{c[A>>2]=0;y=z;break}}else{u=c[g+(f+8)>>2]|0;if(u>>>0<j>>>0){an();return 0}v=u+12|0;if((c[v>>2]|0)!=(o|0)){an();return 0}w=t+8|0;if((c[w>>2]|0)==(o|0)){c[v>>2]=t;c[w>>2]=u;y=t;break}else{an();return 0}}}while(0);if((s|0)==0){break}t=g+(f+28)|0;l=1144+(c[t>>2]<<2)|0;do{if((o|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[211]=c[211]&~(1<<c[t>>2]);break L1447}else{if(s>>>0<(c[214]|0)>>>0){an();return 0}k=s+16|0;if((c[k>>2]|0)==(o|0)){c[k>>2]=y}else{c[s+20>>2]=y}if((y|0)==0){break L1447}}}while(0);if(y>>>0<(c[214]|0)>>>0){an();return 0}c[y+24>>2]=s;o=c[g+(f+16)>>2]|0;do{if((o|0)!=0){if(o>>>0<(c[214]|0)>>>0){an();return 0}else{c[y+16>>2]=o;c[o+24>>2]=y;break}}}while(0);o=c[g+(f+20)>>2]|0;if((o|0)==0){break}if(o>>>0<(c[214]|0)>>>0){an();return 0}else{c[y+20>>2]=o;c[o+24>>2]=y;break}}}while(0);if(q>>>0<16){c[d>>2]=p|c[d>>2]&1|2;y=g+(p|4)|0;c[y>>2]=c[y>>2]|1;n=a;return n|0}else{c[d>>2]=c[d>>2]&1|b|2;c[g+(b+4)>>2]=q|3;d=g+(p|4)|0;c[d>>2]=c[d>>2]|1;bo(g+b|0,q);n=a;return n|0}return 0}function bo(a,b){a=a|0;b=b|0;var d=0,e=0,f=0,g=0,h=0,i=0,j=0,k=0,l=0,m=0,n=0,o=0,p=0,q=0,r=0,s=0,t=0,u=0,v=0,w=0,x=0,y=0,z=0,A=0,B=0,C=0,D=0,E=0,F=0,G=0,H=0,I=0,J=0,K=0,L=0;d=a;e=d+b|0;f=e;g=c[a+4>>2]|0;L1523:do{if((g&1|0)==0){h=c[a>>2]|0;if((g&3|0)==0){return}i=d+(-h|0)|0;j=i;k=h+b|0;l=c[214]|0;if(i>>>0<l>>>0){an()}if((j|0)==(c[215]|0)){m=d+(b+4)|0;if((c[m>>2]&3|0)!=3){n=j;o=k;break}c[212]=k;c[m>>2]=c[m>>2]&-2;c[d+(4-h)>>2]=k|1;c[e>>2]=k;return}m=h>>>3;if(h>>>0<256){p=c[d+(8-h)>>2]|0;q=c[d+(12-h)>>2]|0;r=880+(m<<1<<2)|0;do{if((p|0)!=(r|0)){if(p>>>0<l>>>0){an()}if((c[p+12>>2]|0)==(j|0)){break}an()}}while(0);if((q|0)==(p|0)){c[210]=c[210]&~(1<<m);n=j;o=k;break}do{if((q|0)==(r|0)){s=q+8|0}else{if(q>>>0<l>>>0){an()}t=q+8|0;if((c[t>>2]|0)==(j|0)){s=t;break}an()}}while(0);c[p+12>>2]=q;c[s>>2]=p;n=j;o=k;break}r=i;m=c[d+(24-h)>>2]|0;t=c[d+(12-h)>>2]|0;do{if((t|0)==(r|0)){u=16-h|0;v=d+(u+4)|0;w=c[v>>2]|0;if((w|0)==0){x=d+u|0;u=c[x>>2]|0;if((u|0)==0){y=0;break}else{z=u;A=x}}else{z=w;A=v}while(1){v=z+20|0;w=c[v>>2]|0;if((w|0)!=0){z=w;A=v;continue}v=z+16|0;w=c[v>>2]|0;if((w|0)==0){break}else{z=w;A=v}}if(A>>>0<l>>>0){an()}else{c[A>>2]=0;y=z;break}}else{v=c[d+(8-h)>>2]|0;if(v>>>0<l>>>0){an()}w=v+12|0;if((c[w>>2]|0)!=(r|0)){an()}x=t+8|0;if((c[x>>2]|0)==(r|0)){c[w>>2]=t;c[x>>2]=v;y=t;break}else{an()}}}while(0);if((m|0)==0){n=j;o=k;break}t=d+(28-h)|0;l=1144+(c[t>>2]<<2)|0;do{if((r|0)==(c[l>>2]|0)){c[l>>2]=y;if((y|0)!=0){break}c[211]=c[211]&~(1<<c[t>>2]);n=j;o=k;break L1523}else{if(m>>>0<(c[214]|0)>>>0){an()}i=m+16|0;if((c[i>>2]|0)==(r|0)){c[i>>2]=y}else{c[m+20>>2]=y}if((y|0)==0){n=j;o=k;break L1523}}}while(0);if(y>>>0<(c[214]|0)>>>0){an()}c[y+24>>2]=m;r=16-h|0;t=c[d+r>>2]|0;do{if((t|0)!=0){if(t>>>0<(c[214]|0)>>>0){an()}else{c[y+16>>2]=t;c[t+24>>2]=y;break}}}while(0);t=c[d+(r+4)>>2]|0;if((t|0)==0){n=j;o=k;break}if(t>>>0<(c[214]|0)>>>0){an()}else{c[y+20>>2]=t;c[t+24>>2]=y;n=j;o=k;break}}else{n=a;o=b}}while(0);a=c[214]|0;if(e>>>0<a>>>0){an()}y=d+(b+4)|0;z=c[y>>2]|0;do{if((z&2|0)==0){if((f|0)==(c[216]|0)){A=(c[213]|0)+o|0;c[213]=A;c[216]=n;c[n+4>>2]=A|1;if((n|0)!=(c[215]|0)){return}c[215]=0;c[212]=0;return}if((f|0)==(c[215]|0)){A=(c[212]|0)+o|0;c[212]=A;c[215]=n;c[n+4>>2]=A|1;c[n+A>>2]=A;return}A=(z&-8)+o|0;s=z>>>3;L1622:do{if(z>>>0<256){g=c[d+(b+8)>>2]|0;t=c[d+(b+12)>>2]|0;h=880+(s<<1<<2)|0;do{if((g|0)!=(h|0)){if(g>>>0<a>>>0){an()}if((c[g+12>>2]|0)==(f|0)){break}an()}}while(0);if((t|0)==(g|0)){c[210]=c[210]&~(1<<s);break}do{if((t|0)==(h|0)){B=t+8|0}else{if(t>>>0<a>>>0){an()}m=t+8|0;if((c[m>>2]|0)==(f|0)){B=m;break}an()}}while(0);c[g+12>>2]=t;c[B>>2]=g}else{h=e;m=c[d+(b+24)>>2]|0;l=c[d+(b+12)>>2]|0;do{if((l|0)==(h|0)){i=d+(b+20)|0;p=c[i>>2]|0;if((p|0)==0){q=d+(b+16)|0;v=c[q>>2]|0;if((v|0)==0){C=0;break}else{D=v;E=q}}else{D=p;E=i}while(1){i=D+20|0;p=c[i>>2]|0;if((p|0)!=0){D=p;E=i;continue}i=D+16|0;p=c[i>>2]|0;if((p|0)==0){break}else{D=p;E=i}}if(E>>>0<a>>>0){an()}else{c[E>>2]=0;C=D;break}}else{i=c[d+(b+8)>>2]|0;if(i>>>0<a>>>0){an()}p=i+12|0;if((c[p>>2]|0)!=(h|0)){an()}q=l+8|0;if((c[q>>2]|0)==(h|0)){c[p>>2]=l;c[q>>2]=i;C=l;break}else{an()}}}while(0);if((m|0)==0){break}l=d+(b+28)|0;g=1144+(c[l>>2]<<2)|0;do{if((h|0)==(c[g>>2]|0)){c[g>>2]=C;if((C|0)!=0){break}c[211]=c[211]&~(1<<c[l>>2]);break L1622}else{if(m>>>0<(c[214]|0)>>>0){an()}t=m+16|0;if((c[t>>2]|0)==(h|0)){c[t>>2]=C}else{c[m+20>>2]=C}if((C|0)==0){break L1622}}}while(0);if(C>>>0<(c[214]|0)>>>0){an()}c[C+24>>2]=m;h=c[d+(b+16)>>2]|0;do{if((h|0)!=0){if(h>>>0<(c[214]|0)>>>0){an()}else{c[C+16>>2]=h;c[h+24>>2]=C;break}}}while(0);h=c[d+(b+20)>>2]|0;if((h|0)==0){break}if(h>>>0<(c[214]|0)>>>0){an()}else{c[C+20>>2]=h;c[h+24>>2]=C;break}}}while(0);c[n+4>>2]=A|1;c[n+A>>2]=A;if((n|0)!=(c[215]|0)){F=A;break}c[212]=A;return}else{c[y>>2]=z&-2;c[n+4>>2]=o|1;c[n+o>>2]=o;F=o}}while(0);o=F>>>3;if(F>>>0<256){z=o<<1;y=880+(z<<2)|0;C=c[210]|0;b=1<<o;do{if((C&b|0)==0){c[210]=C|b;G=y;H=880+(z+2<<2)|0}else{o=880+(z+2<<2)|0;d=c[o>>2]|0;if(d>>>0>=(c[214]|0)>>>0){G=d;H=o;break}an()}}while(0);c[H>>2]=n;c[G+12>>2]=n;c[n+8>>2]=G;c[n+12>>2]=y;return}y=n;G=F>>>8;do{if((G|0)==0){I=0}else{if(F>>>0>16777215){I=31;break}H=(G+1048320|0)>>>16&8;z=G<<H;b=(z+520192|0)>>>16&4;C=z<<b;z=(C+245760|0)>>>16&2;o=14-(b|H|z)+(C<<z>>>15)|0;I=F>>>((o+7|0)>>>0)&1|o<<1}}while(0);G=1144+(I<<2)|0;c[n+28>>2]=I;c[n+20>>2]=0;c[n+16>>2]=0;o=c[211]|0;z=1<<I;if((o&z|0)==0){c[211]=o|z;c[G>>2]=y;c[n+24>>2]=G;c[n+12>>2]=n;c[n+8>>2]=n;return}z=c[G>>2]|0;if((I|0)==31){J=0}else{J=25-(I>>>1)|0}L1716:do{if((c[z+4>>2]&-8|0)==(F|0)){K=z}else{I=z;G=F<<J;while(1){L=I+16+(G>>>31<<2)|0;o=c[L>>2]|0;if((o|0)==0){break}if((c[o+4>>2]&-8|0)==(F|0)){K=o;break L1716}else{I=o;G=G<<1}}if(L>>>0<(c[214]|0)>>>0){an()}c[L>>2]=y;c[n+24>>2]=I;c[n+12>>2]=n;c[n+8>>2]=n;return}}while(0);L=K+8|0;F=c[L>>2]|0;J=c[214]|0;if(K>>>0<J>>>0){an()}if(F>>>0<J>>>0){an()}c[F+12>>2]=y;c[L>>2]=y;c[n+8>>2]=F;c[n+12>>2]=K;c[n+24>>2]=0;return}function bp(b){b=b|0;var c=0;c=b;while(a[c]|0){c=c+1|0}return c-b|0}function bq(b,c){b=b|0;c=c|0;var d=0;do{a[b+d|0]=a[c+d|0];d=d+1|0}while(a[c+(d-1)|0]|0);return b|0}function br(b,d,e){b=b|0;d=d|0;e=e|0;var f=0;f=b|0;if((b&3)==(d&3)){while(b&3){if((e|0)==0)return f|0;a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}while((e|0)>=4){c[b>>2]=c[d>>2];b=b+4|0;d=d+4|0;e=e-4|0}}while((e|0)>0){a[b]=a[d]|0;b=b+1|0;d=d+1|0;e=e-1|0}return f|0}function bs(b,d,e){b=b|0;d=d|0;e=e|0;var f=0,g=0,h=0;f=b+e|0;if((e|0)>=20){d=d&255;e=b&3;g=d|d<<8|d<<16|d<<24;h=f&~3;if(e){e=b+4-e|0;while((b|0)<(e|0)){a[b]=d;b=b+1|0}}while((b|0)<(h|0)){c[b>>2]=g;b=b+4|0}}while((b|0)<(f|0)){a[b]=d;b=b+1|0}}function bt(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0;while((e|0)<(d|0)){a[b+e|0]=f?0:a[c+e|0]|0;f=f?1:(a[c+e|0]|0)==0;e=e+1|0}return b|0}function bu(a){a=a|0;if((a|0)<65)return a|0;if((a|0)>90)return a|0;return a-65+97|0}function bv(b,c,d){b=b|0;c=c|0;d=d|0;var e=0,f=0,g=0;while(e>>>0<d>>>0){f=bu(a[b+e|0]|0)|0;g=bu(a[c+e|0]|0)|0;if((f|0)==(g|0)&(f|0)==0)return 0;if((f|0)==0)return-1;if((g|0)==0)return 1;if((f|0)==(g|0)){e=e+1|0;continue}else{return(f>>>0>g>>>0?1:-1)|0}}return 0}function bw(a,b){a=a|0;b=b|0;return bv(a,b,-1)|0}function bx(a,b){a=a|0;b=b|0;return aK[a&1](b|0)|0}function by(a){a=a|0;aL[a&1]()}function bz(a,b,c){a=a|0;b=b|0;c=c|0;return aM[a&1](b|0,c|0)|0}function bA(a,b){a=a|0;b=b|0;aN[a&1](b|0)}function bB(a){a=a|0;$(0);return 0}function bC(){$(1)}function bD(a,b){a=a|0;b=b|0;$(2);return 0}function bE(a){a=a|0;$(3)}
// EMSCRIPTEN_END_FUNCS
var aK=[bB,bB];var aL=[bC,bC];var aM=[bD,bD];var aN=[bE,bE];return{_strlen:bp,_strcpy:bq,_free:bk,_realloc:bl,_strncpy:bt,_tolower:bu,_urarlib_freelist:a7,_strncasecmp:bv,_memset:bs,_malloc:bj,_urarlib_list:a5,_memcpy:br,_strcasecmp:bw,_urarlib_get:a3,runPostSets:a2,stackAlloc:aO,stackSave:aP,stackRestore:aQ,setThrew:aR,setTempRet0:aU,setTempRet1:aV,setTempRet2:aW,setTempRet3:aX,setTempRet4:aY,setTempRet5:aZ,setTempRet6:a_,setTempRet7:a$,setTempRet8:a0,setTempRet9:a1,dynCall_ii:bx,dynCall_v:by,dynCall_iii:bz,dynCall_vi:bA}})
// EMSCRIPTEN_END_ASM
({ "Math": Math, "Int8Array": Int8Array, "Int16Array": Int16Array, "Int32Array": Int32Array, "Uint8Array": Uint8Array, "Uint16Array": Uint16Array, "Uint32Array": Uint32Array, "Float32Array": Float32Array, "Float64Array": Float64Array }, { "abort": abort, "assert": assert, "asmPrintInt": asmPrintInt, "asmPrintFloat": asmPrintFloat, "min": Math_min, "invoke_ii": invoke_ii, "invoke_v": invoke_v, "invoke_iii": invoke_iii, "invoke_vi": invoke_vi, "_lseek": _lseek, "_snprintf": _snprintf, "_fgetc": _fgetc, "_fread": _fread, "_fclose": _fclose, "_abort": _abort, "_close": _close, "_pread": _pread, "_fopen": _fopen, "_open": _open, "_strchr": _strchr, "_sysconf": _sysconf, "___setErrNo": ___setErrNo, "__reallyNegative": __reallyNegative, "_fseek": _fseek, "_send": _send, "_write": _write, "_ftell": _ftell, "_strdup": _strdup, "_read": _read, "_time": _time, "__formatString": __formatString, "_recv": _recv, "_pwrite": _pwrite, "_sbrk": _sbrk, "_fsync": _fsync, "___errno_location": ___errno_location, "_fwrite": _fwrite, "STACKTOP": STACKTOP, "STACK_MAX": STACK_MAX, "tempDoublePtr": tempDoublePtr, "ABORT": ABORT, "NaN": NaN, "Infinity": Infinity, "_stderr": _stderr }, buffer);
var _strlen = Module["_strlen"] = asm["_strlen"];
var _strcpy = Module["_strcpy"] = asm["_strcpy"];
var _free = Module["_free"] = asm["_free"];
var _realloc = Module["_realloc"] = asm["_realloc"];
var _strncpy = Module["_strncpy"] = asm["_strncpy"];
var _tolower = Module["_tolower"] = asm["_tolower"];
var _urarlib_freelist = Module["_urarlib_freelist"] = asm["_urarlib_freelist"];
var _strncasecmp = Module["_strncasecmp"] = asm["_strncasecmp"];
var _memset = Module["_memset"] = asm["_memset"];
var _malloc = Module["_malloc"] = asm["_malloc"];
var _urarlib_list = Module["_urarlib_list"] = asm["_urarlib_list"];
var _memcpy = Module["_memcpy"] = asm["_memcpy"];
var _strcasecmp = Module["_strcasecmp"] = asm["_strcasecmp"];
var _urarlib_get = Module["_urarlib_get"] = asm["_urarlib_get"];
var runPostSets = Module["runPostSets"] = asm["runPostSets"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_v = Module["dynCall_v"] = asm["dynCall_v"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
Runtime.stackAlloc = function(size) { return asm['stackAlloc'](size) };
Runtime.stackSave = function() { return asm['stackSave']() };
Runtime.stackRestore = function(top) { asm['stackRestore'](top) };
// Warning: printing of i64 values may be slightly rounded! No deep i64 math used, so precise i64 code not included
var i64Math = null;
// === Auto-generated postamble setup entry stuff ===
var initialStackTop;
var inMain;
Module['callMain'] = Module.callMain = function callMain(args) {
  assert(runDependencies == 0, 'cannot call main when async dependencies remain! (listen on __ATMAIN__)');
  assert(__ATPRERUN__.length == 0, 'cannot call main when preRun functions remain to be called');
  args = args || [];
  ensureInitRuntime();
  var argc = args.length+1;
  function pad() {
    for (var i = 0; i < 4-1; i++) {
      argv.push(0);
    }
  }
  var argv = [allocate(intArrayFromString("/bin/this.program"), 'i8', ALLOC_NORMAL) ];
  pad();
  for (var i = 0; i < argc-1; i = i + 1) {
    argv.push(allocate(intArrayFromString(args[i]), 'i8', ALLOC_NORMAL));
    pad();
  }
  argv.push(0);
  argv = allocate(argv, 'i32', ALLOC_NORMAL);
  initialStackTop = STACKTOP;
  inMain = true;
  var ret;
  try {
    ret = Module['_main'](argc, argv, 0);
  }
  catch(e) {
    if (e && typeof e == 'object' && e.type == 'ExitStatus') {
      // exit() throws this once it's done to make sure execution
      // has been stopped completely
      Module.print('Exit Status: ' + e.value);
      return e.value;
    } else if (e == 'SimulateInfiniteLoop') {
      // running an evented main loop, don't immediately exit
      Module['noExitRuntime'] = true;
    } else {
      throw e;
    }
  } finally {
    inMain = false;
  }
  // if we're not running an evented main loop, it's time to exit
  if (!Module['noExitRuntime']) {
    exit(ret);
  }
}
function run(args) {
  args = args || Module['arguments'];
  if (runDependencies > 0) {
    Module.printErr('run() called, but dependencies remain, so not running');
    return;
  }
  preRun();
  if (runDependencies > 0) {
    // a preRun added a dependency, run will be called later
    return;
  }
  function doRun() {
    ensureInitRuntime();
    preMain();
    calledRun = true;
    if (Module['_main'] && shouldRunNow) {
      Module['callMain'](args);
    }
    postRun();
  }
  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      if (!ABORT) doRun();
    }, 1);
  } else {
    doRun();
  }
}
Module['run'] = Module.run = run;
function exit(status) {
  ABORT = true;
  STACKTOP = initialStackTop;
  // TODO call externally added 'exit' callbacks with the status code.
  // It'd be nice to provide the same interface for all Module events (e.g.
  // prerun, premain, postmain). Perhaps an EventEmitter so we can do:
  // Module.on('exit', function (status) {});
  // exit the runtime
  exitRuntime();
  if (inMain) {
    // if we're still inside the callMain's try/catch, we need to throw an
    // exception in order to immediately terminate execution.
    throw { type: 'ExitStatus', value: status };
  }
}
Module['exit'] = Module.exit = exit;
function abort(text) {
  if (text) {
    Module.print(text);
  }
  ABORT = true;
  throw 'abort() at ' + (new Error().stack);
}
Module['abort'] = Module.abort = abort;
// {{PRE_RUN_ADDITIONS}}
if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}
// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;
if (Module['noInitialRun']) {
  shouldRunNow = false;
}
run();
// {{POST_RUN_ADDITIONS}}
// {{MODULE_ADDITIONS}}

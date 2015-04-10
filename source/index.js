var Immutable = require('immutable');
var contiguous = require('contiguous');
var string = require('is-string');

var list = Immutable.List.isList.bind(Immutable.List);
var map = Immutable.Map.isMap.bind(Immutable.Map);

// Vocabulary
var COMPRISE = 'comprise';
var EMPHASIZE = 'emphasize';
var INCLUDE = 'include';
var SUMMARIZE = 'summarize';
var YES = 'yes';

var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/;

var stringOfASCIIPrintable = function(argument) {
  return ASCII_PRINTABLE_RE.test(argument);
};

var stringWithContiguousSpaces = function(argument) {
  return argument.indexOf('  ') > -1;
};

var stringStartsWithSpace = function(argument) {
  return (
    string(argument) &&
    argument[0] === ' '
  );
};

var stringEndsWithSpace = function(argument) {
  return (
    string(argument) &&
    argument[argument.length - 1] === ' '
  );
};

var trimString = function(argument) {
  return (
    argument[0] !== ' ' &&
    argument[argument.length - 1] !== ' '
  );
};

var contentString = function(argument) {
  return (
    string(argument) &&
    argument.length > 0 &&
    !stringWithContiguousSpaces(argument) &&
    stringOfASCIIPrintable(argument)
  );
};

var hasContiguousStrings = function(argument) {
  return contiguous(argument, string);
};

var hasOneProperty = function(object, key) {
  var keys = object.keySeq();
  return (
    keys.count() === 1 &&
    keys.contains(key)
  );
};

var term = exports.term = exports.heading = exports.value =
  function(argument) {
    return (
      contentString(argument) &&
      trimString(argument)
    );
  };

var heading = term;

var simpleObject = function(type) {
  return function(argument) {
    return (
      map(argument) &&
      hasOneProperty(argument, type) &&
      term(argument.get(type))
    );
  };
};

var definition = exports.definition = simpleObject('define');
var use = exports.use = simpleObject('use');
var insertion = exports.insertion = simpleObject('insert');
var reference = exports.reference = simpleObject('reference');

var digest = exports.digest = (function() {
  var DIGEST_RE = /^[abcdef0123456789]{64}$/;
  return function(input) {
    return (
      string(input) &&
      DIGEST_RE.test(input)
    );
  };
})();

var inclusionFactory = function(formPredicate) {
  return function(argument) {
    return (
      map(argument) &&

      (
        !argument.has(SUMMARIZE) ||
        heading(argument.get(SUMMARIZE))
      ) &&

      argument.has(INCLUDE) &&
      formPredicate(argument.get(INCLUDE)) &&

      argument.keySeq().every(function(key) {
        return (
          key === INCLUDE ||
          key === SUMMARIZE
        );
      })
    );
  };
};

exports.inclusion = inclusionFactory(digest);
exports.nestedInclusion = function() {
  return inclusionFactory(exports.nestedForm).apply(this, arguments);
};

var formFactory = function(inclusionPredicate) {
  return function(argument) {
    if (!map(argument)) {
      return false;
    }
    var content = argument.get(COMPRISE);

    return (
      argument.has(COMPRISE) &&
      list(content) &&
      content.count() > 0 &&
      content.every(function(element) {
        return contentString(element) ||
          inclusionPredicate(element) ||
          use(element) ||
          reference(element) ||
          definition(element) ||
          insertion(element);
      }) &&
      !hasContiguousStrings(content) &&
      !stringStartsWithSpace(content.first()) &&
      !stringEndsWithSpace(content.last()) &&

      (
        !argument.has(EMPHASIZE) ||
        argument.get(EMPHASIZE) === YES
      ) &&

      argument.keySeq().every(function(key) {
        return (
          key === COMPRISE ||
          key === EMPHASIZE
        );
      })
    );
  };
};

exports.form = formFactory(exports.inclusion);
exports.nestedForm = exports.nestedForm =
  formFactory(exports.nestedInclusion);

exports.version = '1.0.0';

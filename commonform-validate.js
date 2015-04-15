var array = require('is-array');
var contiguous = require('contiguous');
var object = require('is-object');
var string = require('is-string');

var keyCount = function(argument) {
  return Object.keys(argument).length;
};

var hasProperty = function(argument, key, predicate) {
  return (
    argument.hasOwnProperty(key) &&
    predicate(argument[key])
  );
};

var text = (function() {
  var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/;

  return function(argument) {
    return (
      string(argument) &&
      argument.length > 0 &&
      argument.indexOf('  ') < 0 &&
      ASCII_PRINTABLE_RE.test(argument)
    );
  };
})();

var term = function(argument) {
  return (
    text(argument) &&
    argument[0] !== ' ' &&
    argument[argument.length - 1] !== ' '
  );
};

var simpleObject = function(permittedKey) {
  return function(argument) {
    return (
      object(argument) &&
      keyCount(argument) === 1 &&
      hasProperty(argument, permittedKey, term)
    );
  };
};

exports.term = exports.heading = exports.value = term;

var blank = exports.blank = simpleObject('blank');
var definition = exports.definition = simpleObject('definition');
var reference = exports.reference = simpleObject('reference');
var use = exports.use = simpleObject('use');

var form;

var child = exports.child = function(argument) {
  return (
    object(argument) &&
    hasProperty(argument, 'form', form) &&
    (
      keyCount(argument) === 1 ||
      (
        keyCount(argument) === 2 &&
        hasProperty(argument, 'heading', term)
      )
    )
  );
};

var content = exports.content = (function() {
  var predicates = [blank, child, definition, reference, text, use];

  return function(argument) {
    return predicates.some(function(predicate) {
      return predicate(argument);
    });
  };
})();

form = exports.form = (function() {
  var leadingSpaceString = function(argument) {
    return (
      string(argument) &&
      argument[0] === ' '
    );
  };

  var terminalSpaceString = function(argument) {
    return (
      string(argument) &&
      argument[argument.length - 1] === ' '
    );
  };

  return function(argument) {
    return (
      object(argument) &&
      hasProperty(argument, 'content', function(elements) {
        return (
          array(elements) &&
          elements.length > 0 &&
          elements.every(content) &&
          !contiguous(elements, string) &&
          !leadingSpaceString(elements[0]) &&
          !terminalSpaceString(elements[elements.length - 1])
        );
      }) &&
      (
        keyCount(argument) === 1 ||
        (
          keyCount(argument) === 2 &&
          argument.conspicuous === 'yes'
        )
      )
    );
  };
})();

exports.version = '0.4.0';

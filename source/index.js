var array = require('is-array');
var contiguous = require('contiguous');
var object = require('is-object');
var string = require('is-string');

var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/;
var DIGEST_RE = /^[abcdef0123456789]{64}$/;

var keyCount = function(argument) {
  return Object.keys(argument).length;
};

var leadingSpaceString = function(argument) {
  return string(argument) && argument[0] === ' ';
};

var terminalSpaceString = function(argument) {
  return string(argument) && argument[argument.length - 1] === ' ';
};

var text = exports.text = function(argument) {
  return (
    string(argument) &&
    argument.length > 0 &&
    ASCII_PRINTABLE_RE.test(argument) &&
    argument.indexOf('  ') < 0
  );
};

var hasProperty = function(argument, key, predicate) {
  return key in argument && predicate(argument[key]);
};

var term = exports.term = exports.heading = exports.value =
  function(argument) {
    return (
      text(argument) &&
      argument[0] !== ' ' &&
      argument[argument.length - 1] !== ' '
    );
  };

var singleProperty = function(permittedKey) {
  return function(argument) {
    return (
      object(argument) &&
      keyCount(argument) === 1 &&
      permittedKey in argument &&
      term(argument[permittedKey])
    );
  };
};

var blank = exports.blank = singleProperty('blank');
var definition = exports.definition = singleProperty('definition');
var reference = exports.reference = singleProperty('reference');
var use = exports.use = singleProperty('use');

var digest = exports.digest = function(input) {
  return string(input) && DIGEST_RE.test(input);
};

var child = exports.child = function(argument) {
  return (
    object(argument) &&
    hasProperty(argument, 'digest', digest) &&
    (
      (
        hasProperty(argument, 'heading', term) &&
        keyCount(argument) === 2
      ) || keyCount(argument) === 1
    )
  );
};

var contentPredicates = [
  blank, child, definition, reference, text, use
];

var content = exports.content = function(argument) {
  return contentPredicates.some(function(predicate) {
    return predicate(argument);
  });
};

exports.form = function(argument) {
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
    }) && (
      (
        argument.conspicuous === 'yes' &&
        keyCount(argument) === 2
      ) || keyCount(argument) === 1
    )
  );
};

exports.version = '1.0.0';

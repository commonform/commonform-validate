var Immutable = require('immutable');
var contiguous = require('contiguous');
var string = require('is-string');

var list = Immutable.List.isList.bind(Immutable.List);
var map = Immutable.Map.isMap.bind(Immutable.Map);

var CONTENT = 'content';
var CONSPICUOUS = 'conspicuous';
var HEADING = 'heading';

var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/;
var DIGEST_RE = /^[abcdef0123456789]{64}$/;

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
  return argument.has(key) && predicate(argument.get(key));
};

var term = exports.term = exports.heading = exports.value =
  function(argument) {
    return (
      text(argument) &&
      argument[0] !== ' ' &&
      argument[argument.length - 1] !== ' '
    );
  };

var singlePropertyMap = function(permittedKey) {
  return function(argument) {
    return (
      map(argument) &&
      argument.count() === 1 &&
      argument.has(permittedKey) &&
      term(argument.get(permittedKey))
    );
  };
};

var definition = exports.definition = singlePropertyMap('definition');
var use = exports.use = singlePropertyMap('use');
var blank = exports.blank = singlePropertyMap('blank');
var reference = exports.reference = singlePropertyMap('reference');

var digest = exports.digest = function(input) {
  return string(input) && DIGEST_RE.test(input);
};

var child = exports.child = function(argument) {
  return (
    map(argument) &&
    hasProperty(argument, 'digest', digest) && (
      (
        !argument.has(HEADING) &&
        argument.count() === 1
      ) || (
        term(argument.get(HEADING)) &&
        argument.count() === 2
      )
    )
  );
};

var contentPredicates = [
  text, child, use, reference, definition, blank
];

var content = exports.content = function(argument) {
  return contentPredicates.some(function(predicate) {
    return predicate(argument);
  });
};

exports.form = function(argument) {
  return (
    map(argument) &&
    hasProperty(argument, CONTENT, function(elements) {
      return (
        list(elements) &&
        elements.count() > 0 &&
        elements.every(content) &&
        !contiguous(elements, string) &&
        !leadingSpaceString(elements.first()) &&
        !terminalSpaceString(elements.last())
      );
    }) && (
      (
        argument.get(CONSPICUOUS) === 'yes' &&
        argument.count() === 2
      ) || argument.count() === 1
    )
  );
};

exports.version = '1.0.0';

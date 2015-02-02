var owasp = require('owasp-password-strength-test');
var semver = require('semver');

var hashing = require('commonform-hashing');

var toString = Object.prototype.toString;

var isString = function(argument) {
  return toString.call(argument) === '[object String]';
};

var isObject = function(argument) {
  return toString.call(argument) === '[object Object]';
};

var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/;

var onlyASCIIPrintable = function(argument) {
  return ASCII_PRINTABLE_RE.test(argument);
};

var hasContiguousSpaces = function(argument) {
  return argument.indexOf('  ') > -1;
};

var leadsWithSpace = function(argument) {
  return argument[0][0] === ' ';
};

var endsWithSpace = function(argument) {
  var last = argument[argument.length - 1];
  return last[last.length - 1] === ' ';
};

var trimString = function(argument) {
  return argument[0] !== ' ' &&
    argument[argument.length - 1] !== ' ';
};

var isEmpty = function(argument) {
  return argument.length === 0;
};

var contentString = function(argument) {
  return isString(argument) &&
    !isEmpty(argument) &&
    !hasContiguousSpaces(argument) &&
    onlyASCIIPrintable(argument);
};

var hasContiguousStrings = function(argument) {
  return argument.some(function(element, index, array) {
    if (index === 0) {
      return false;
    } else {
      var previous = array[index - 1];
      return isString(previous) && isString(element);
    }
  });
};

var hasOneProperty = function(object, key) {
  var keys = Object.keys(object);
  return keys.length === 1 && keys[0] === key;
};

var term = exports.isTerm = exports.isSummary = exports.isValue =
  function(argument) {
    return contentString(argument) && trimString(argument);
  };

var summary = term;

var simpleObject = function(type) {
  return function(argument) {
    return isObject(argument) &&
      hasOneProperty(argument, type) &&
      term(argument[type]);
  };
};

var definition = exports.isDefinition = simpleObject('definition');
var use = exports.isUse = simpleObject('use');
var field = exports.isField = simpleObject('field');
var reference = exports.isReference = simpleObject('reference');

var subFactory = function(formPredicate) {
  return function(argument) {
    if (!isObject(argument)) {
      return false;
    }
    var keys = Object.keys(argument);
    return keys.length === 2 &&

      keys.indexOf('summary') > -1 &&
      summary(argument.summary) &&

      keys.indexOf('form') > -1 &&
      formPredicate(argument.form);
  };
};

exports.isSubForm = subFactory(hashing.isDigest);
exports.isNestedSubForm = function() {
  return subFactory(exports.isForm).apply(this, arguments);
};

var formFactory = function(subFormPredicate) {
  return function(argument) {
    if (!isObject(argument)) {
      return false;
    }
    var content = argument.content;
    var keys = Object.keys(argument);

    return (
      keys.indexOf('content') > -1 &&
      Array.isArray(content) &&
      content.length > 0 &&
      content.every(function(element) {
        return contentString(element) ||
          subFormPredicate(element) ||
          use(element) ||
          reference(element) ||
          definition(element) ||
          field(element);
      }) &&
      !hasContiguousStrings(content) &&
      !leadsWithSpace(content) &&
      !endsWithSpace(content) &&

      (
        keys.indexOf('conspicuous') < 0 ||
        argument.conspicuous === 'true'
      ) &&

      !keys.some(function(key) {
        return ['conspicuous', 'content'].indexOf(key) < 0;
      })
    );
  };
};

exports.isForm = formFactory(exports.isSubForm);
exports.isNestedForm = formFactory(exports.isNestedSubForm);

var version = exports.isVersion = function(argument) {
  return semver.valid(argument) &&
    semver.clean(argument) === argument;
};

var bookmarkName = exports.isBookmarkName = term;

exports.isBookmark = function(argument) {
  return isObject(argument) &&
    argument.hasOwnProperty('version') &&
    version(argument.version) &&

    argument.hasOwnProperty('name') &&
    bookmarkName(argument.name) &&

    argument.hasOwnProperty('form') &&
    hashing.isDigest(argument.form);
};

exports.AUTHORIZATIONS = [
 'administer', 'mirror', 'read', 'search', 'write'
];

var authorization = exports.isAuthorization = function(argument) {
  return exports.AUTHORIZATIONS.indexOf(argument) > -1;
};

var password = exports.isPassword = function(argument) {
  return owasp.test(argument).errors.length === 0;
};

var userName = exports.isUserName = function(argument) {
  return term(argument) && argument.length > 5;
};

exports.isUser = function(argument) {
  return isObject(argument) &&
    argument.hasOwnProperty('name') &&
    userName(argument.name) &&

    argument.hasOwnProperty('password') &&
    password(argument.password) &&

    argument.hasOwnProperty('authorizations') &&
    !isEmpty(argument.authorizations) &&
    argument.authorizations.every(function(element) {
      return authorization(element);
    });
};

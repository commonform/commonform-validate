var owasp = require('owasp-password-strength-test');
var semver = require('semver');

var toString = Object.prototype.toString;

var string = function(argument) {
  return toString.call(argument) === '[object String]';
};

var object = function(argument) {
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

var empty = function(argument) {
  return argument.length === 0;
};

var contentString = function(argument) {
  return string(argument) &&
    !empty(argument) &&
    !hasContiguousSpaces(argument) &&
    onlyASCIIPrintable(argument);
};

var hasContiguousStrings = function(argument) {
  return argument.some(function(element, index, array) {
    if (index === 0) {
      return false;
    } else {
      var previous = array[index - 1];
      return string(previous) && string(element);
    }
  });
};

var hasOneProperty = function(object, key) {
  var keys = Object.keys(object);
  return keys.length === 1 && keys[0] === key;
};

var term = exports.term = exports.summary = exports.value =
  function(argument) {
    return contentString(argument) && trimString(argument);
  };

var summary = term;

var simpleObject = function(type) {
  return function(argument) {
    return object(argument) &&
      hasOneProperty(argument, type) &&
      term(argument[type]);
  };
};

var definition = exports.definition = simpleObject('definition');
var use = exports.use = simpleObject('use');
var field = exports.field = simpleObject('field');
var reference = exports.reference = simpleObject('reference');

var digest = exports.digest = (function() {
  var DIGEST_RE = /^[abcdef0123456789]{64}$/;
  return function(input) {
    return typeof input === 'string' && DIGEST_RE.test(input);
  };
})();

var subFactory = function(formPredicate) {
  return function(argument) {
    if (!object(argument)) {
      return false;
    }
    var keys = Object.keys(argument);
    return (
        keys.indexOf('summary') < 0 ||
        summary(argument.summary)
      ) &&

      keys.indexOf('form') > -1 &&
      formPredicate(argument.form) &&

      !keys.some(function(key) {
        return ['form', 'summary'].indexOf(key) < 0;
      });
  };
};

exports.subForm = subFactory(digest);
exports.nestedSubForm = function() {
  return subFactory(exports.nestedForm).apply(this, arguments);
};

var formFactory = function(subFormPredicate) {
  return function(argument) {
    if (!object(argument)) {
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

exports.form = formFactory(exports.subForm);
var nestedForm = exports.nestedForm =
  formFactory(exports.nestedSubForm);

var semanticVersion = exports.semanticVersion = function(argument) {
  return semver.valid(argument) &&
    semver.clean(argument) === argument;
};

var bookmarkName = exports.bookmarkName = function(argument) {
  return term(argument) &&
    argument.toLowerCase() === argument &&
    argument.indexOf('@') < 0;
};

exports.bookmark = function(argument) {
  return object(argument) &&
    argument.hasOwnProperty('version') &&
    semanticVersion(argument.version) &&

    argument.hasOwnProperty('name') &&
    bookmarkName(argument.name) &&

    argument.hasOwnProperty('form') &&
    digest(argument.form);
};

exports.AUTHORIZATIONS = [
 'administer', 'mirror', 'read', 'search', 'write'
];

var authorization = exports.authorization = function(argument) {
  return exports.AUTHORIZATIONS.indexOf(argument) > -1;
};

var password = exports.password = function(argument) {
  return owasp.test(argument).errors.length === 0;
};

var userName = exports.userName = function(argument) {
  return term(argument) && argument.length > 5;
};

var RESERVED_NAMES = ['librarian', 'anonymous'];

var reservedUserName = exports.reservedUserName = function(argument) {
  return RESERVED_NAMES.indexOf(argument) > -1;
};

var hasValidAuthorizations = function(argument) {
  return argument.hasOwnProperty('authorizations') &&
    !empty(argument.authorizations) &&
    argument.authorizations.every(function(element) {
      return authorization(element);
    });
};

var hasValidPassword = function(argument) {
  return argument.hasOwnProperty('password') &&
    password(argument.password);
};

exports.user = function(argument) {
  return object(argument) &&
    argument.hasOwnProperty('name') &&
    userName(argument.name) &&
    !reservedUserName(argument.name) &&
    hasValidPassword(argument) &&
    hasValidAuthorizations(argument);
};

exports.anonymousUser = function(argument) {
  return object(argument) &&
    argument.hasOwnProperty('name') &&
    argument.name === 'anonymous' &&
    // No password
    hasValidAuthorizations(argument);
};

exports.librarianUser = function(argument) {
  return object(argument) &&
    argument.hasOwnProperty('name') &&
    argument.name === 'librarian' &&
    hasValidPassword(argument);
    // No authorizations
};

var onlyStringValues = function(argument) {
  var type = toString.call(argument);
  switch (type) {
    case '[object String]':
      return true;
    case '[object Object]':
      return Object.keys(argument).every(function(key) {
        return onlyStringValues(argument[key]);
      });
    case '[object Array]':
      return argument.every(onlyStringValues);
    default:
      return false;
  }
};

var values = exports.values = function(argument) {
  return object(argument) &&
    Object.keys(argument).every(function(key) {
      return string(argument[key]);
    });
};

var metadata = exports.metadata = function(argument) {
  return object(argument) &&
    argument.hasOwnProperty('title') &&
    string(argument.title) &&
    Object.keys(argument).length === 1;
};

var preferences = exports.preferences = function(argument) {
  return object(argument) &&
    onlyStringValues(argument);
};

exports.project = function(argument) {
  return object(argument) &&
    argument.hasOwnProperty('commonform') &&
    semanticVersion(argument.commonform) &&

    argument.hasOwnProperty('form') &&
    nestedForm(argument.form) &&

    argument.hasOwnProperty('values') &&
    values(argument.values) &&

    argument.hasOwnProperty('metadata') &&
    metadata(argument.metadata) &&

    argument.hasOwnProperty('preferences') &&
    preferences(argument.preferences);
};

exports.version = '0.1.3';

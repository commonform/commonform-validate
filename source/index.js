var Immutable = require('immutable');
var semver = require('semver');

var string = (function() {
  var toString = Object.prototype.toString;
  return function(argument) {
    return toString.call(argument) === '[object String]';
  };
})();

var isMap = Immutable.Map.isMap.bind(Immutable.Map);
var isList = Immutable.List.isList.bind(Immutable.List);

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
  return argument.some(function(element, index, list) {
    if (index === 0) {
      return false;
    } else {
      var previous = list.get(index - 1);
      return (
        string(previous) &&
        string(element)
      );
    }
  });
};

var hasOneProperty = function(object, key) {
  var keys = object.keySeq();
  return (
    keys.count() === 1 &&
    keys.contains(key)
  );
};

var term = exports.term = exports.summary = exports.value =
  function(argument) {
    return (
      contentString(argument) &&
      trimString(argument)
    );
  };

var summary = term;

var simpleObject = function(type) {
  return function(argument) {
    return (
      isMap(argument) &&
      hasOneProperty(argument, type) &&
      term(argument.get(type))
    );
  };
};

var definition = exports.definition = simpleObject('definition');
var use = exports.use = simpleObject('use');
var field = exports.field = simpleObject('field');
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

var subFactory = function(formPredicate) {
  return function(argument) {
    return (
      isMap(argument) &&

      (
        !argument.has('summary') ||
        summary(argument.get('summary'))
      ) &&

      argument.has('form') &&
      formPredicate(argument.get('form')) &&

      argument.keySeq().every(function(key) {
        return (
          key === 'form' ||
          key === 'summary'
        );
      })
    );
  };
};

exports.subForm = subFactory(digest);
exports.nestedSubForm = function() {
  return subFactory(exports.nestedForm).apply(this, arguments);
};

var formFactory = function(subFormPredicate) {
  return function(argument) {
    if (!isMap(argument)) {
      return false;
    }
    var content = argument.get('content');

    return (
      argument.has('content') &&
      isList(content) &&
      content.count() > 0 &&
      content.every(function(element) {
        return contentString(element) ||
          subFormPredicate(element) ||
          use(element) ||
          reference(element) ||
          definition(element) ||
          field(element);
      }) &&
      !hasContiguousStrings(content) &&
      !stringStartsWithSpace(content.first()) &&
      !stringEndsWithSpace(content.last()) &&

      (
        !argument.has('conspicuous') ||
        argument.get('conspicuous') === 'true'
      ) &&

      argument.keySeq().every(function(key) {
        return (
          key === 'content' ||
          key === 'conspicuous'
        );
      })
    );
  };
};

exports.form = formFactory(exports.subForm);
var nestedForm = exports.nestedForm =
  formFactory(exports.nestedSubForm);

var semanticVersion = exports.semanticVersion = function(argument) {
  return (
    semver.valid(argument) &&
    semver.clean(argument) === argument
  );
};

var bookmarkName = exports.bookmarkName = function(argument) {
  return (
    term(argument) &&
    argument.toLowerCase() === argument &&
    argument.indexOf('@') < 0
  );
};

exports.bookmark = function(argument) {
  return (
    isMap(argument) &&

    argument.has('version') &&
    semanticVersion(argument.get('version')) &&

    argument.has('name') &&
    bookmarkName(argument.get('name')) &&

    argument.has('form') &&
    digest(argument.get('form'))
  );
};

exports.AUTHORIZATIONS = [
 'administer', 'mirror', 'read', 'search', 'write'
];

var onlyStringValues = function(argument) {
  if (string(argument)) {
    return true;
  } else if (isMap(argument) || isList(argument)) {
    return argument.every(onlyStringValues);
  } else {
    return false;
  }
};

var values = exports.values = function(argument) {
  return (
    isMap(argument) &&

    argument.every(string)
  );
};

var metadata = exports.metadata = function(argument) {
  return (
    isMap(argument) &&

    argument.has('title') &&
    string(argument.get('title')) &&

    argument.count() === 1
  );
};

var preferences = exports.preferences = function(argument) {
  return (
    isMap(argument) &&

    onlyStringValues(argument)
  );
};

exports.project = function(argument) {
  return (
    isMap(argument) &&

    argument.has('commonform') &&
    semanticVersion(argument.get('commonform')) &&

    argument.has('form') &&
    nestedForm(argument.get('form')) &&

    argument.has('values') &&
    values(argument.get('values')) &&

    argument.has('metadata') &&
    metadata(argument.get('metadata')) &&

    argument.has('preferences') &&
    preferences(argument.get('preferences'))
  );
};

exports.version = '0.2.0-prerelease';

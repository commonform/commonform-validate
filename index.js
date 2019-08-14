var array = require('is-array')
var contiguous = require('contiguous')
var has = require('has')
var object = require('is-object')
var revedParse = require('reviewers-edition-parse')
var string = require('is-string')
var tlds = require('tlds')

var ALL_LOWER_ALPHA = /^[a-z]+$/

var ASCII_TLDS = tlds.filter(function (tld) {
  return ALL_LOWER_ALPHA.test(tld)
})

function keyCount (argument) {
  return Object.keys(argument).length
}

function hasProperty (argument, key, predicate) {
  return (
    has(argument, key) &&
    predicate(argument[key])
  )
}

var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/

function text (argument) {
  return (
    string(argument) &&
    argument.length > 0 &&
    argument.indexOf('  ') < 0 &&
    ASCII_PRINTABLE_RE.test(argument)
  )
}

function term (argument) {
  return (
    text(argument) &&
    argument[0] !== ' ' &&
    argument[argument.length - 1] !== ' '
  )
}

function simpleObject (permittedKey) {
  return function (argument) {
    return (
      object(argument) &&
      keyCount(argument) === 1 &&
      hasProperty(argument, permittedKey, term)
    )
  }
}

exports.term = exports.heading = exports.value = term

var definition = exports.definition = simpleObject('definition')
var reference = exports.reference = simpleObject('reference')
var use = exports.use = simpleObject('use')

function isEmptyString (argument) {
  return argument === ''
}

exports.blank = blank

function blank (argument) {
  return (
    object(argument) &&
    keyCount(argument) === 1 &&
    hasProperty(argument, 'blank', isEmptyString) &&
    true
  )
}

exports.child = child

function child (argument, options) {
  return (
    object(argument) &&
    hasProperty(argument, 'form', function (argument) {
      return form(argument, options)
    }) &&
    (
      keyCount(argument) === 1 ||
      (
        keyCount(argument) === 2 &&
        hasProperty(argument, 'heading', term)
      )
    ) &&
    true
  )
}

exports.component = component

function component (argument) {
  return (
    object(argument) &&
    (
      hasProperty(argument, 'repository', function repository (value) {
        if (!string(value)) return false
        var split = value.split('.')
        if (split.length <= 2) return false
        var validNames = split.slice(0, -1).every(function (name) {
          return ALL_LOWER_ALPHA.test(name)
        })
        if (!validNames) return false
        if (ASCII_TLDS.indexOf(split[split.length - 1]) === -1) return false
        return true
      }) &&
      hasProperty(argument, 'publisher', function (value) {
        return string(value) && /^[a-z]{2,24}$/.test(value)
      }) &&
      hasProperty(argument, 'project', function (value) {
        return string(value) && /^[a-z0-9-]+$/.test(value)
      }) &&
      hasProperty(argument, 'edition', function (value) {
        return revedParse(value) !== false
      }) &&
      hasProperty(argument, 'substitutions', function (value) {
        return (
          object(value) &&
          hasProperty(value, 'terms', termMapping) &&
          hasProperty(value, 'headings', termMapping) &&
          keyCount(value) === 2
        )
      })
    ) &&
    (
      keyCount(argument) === 5 ||
      (
        keyCount(argument) === 6 &&
        (
          argument.upgrade === 'yes' ||
          hasProperty(argument, 'heading', term)
        )
      ) ||
      (
        keyCount(argument) === 7 &&
        argument.upgrade === 'yes' &&
        hasProperty(argument, 'heading', term)
      )
    ) &&
    true
  )
}

function termMapping (argument) {
  return (
    object(argument) &&
    Object.keys(argument).every(function (key) {
      return term(key) && term(argument[key])
    })
  )
}

exports.content = content

function content (argument, options) {
  var predicates = [blank, child, definition, reference, text, use]
  if (options && options.allowComponents) {
    predicates.push(component)
  }
  return predicates.some(function (predicate) {
    return predicate(argument, options)
  })
}

exports.form = form

function form (argument, options) {
  return (
    object(argument) &&
    hasProperty(argument, 'content', function (elements) {
      return (
        array(elements) &&
        elements.length > 0 &&
        elements.every(function (element) {
          return content(element, options)
        }) &&
        !contiguous(elements, string) &&
        !contiguous(elements, blank) &&
        !spaceAbuttingChild(elements) &&
        !leadingSpaceString(elements[0]) &&
        !terminalSpaceString(elements[elements.length - 1])
      )
    }) &&
    (
      keyCount(argument) === 1 ||
      (
        keyCount(argument) === 2 &&
        argument.conspicuous === 'yes'
      )
    ) &&
    true
  )
}

function leadingSpaceString (argument) {
  return (
    string(argument) &&
    argument[0] === ' '
  )
}

function terminalSpaceString (argument) {
  return (
    string(argument) &&
    argument[argument.length - 1] === ' '
  )
}

function looksLikeAChild (argument) {
  return (
    has(argument, 'form') ||
    has(argument, 'repository')
  )
}

function spaceAbuttingChild (elements) {
  var lastIndex = elements.length - 1
  return elements.some(function (element, index, list) {
    if (!string(element)) {
      return false
    } else {
      if (index > 0) {
        var elementBefore = list[index - 1]
        var childBefore = looksLikeAChild(elementBefore)
        if (childBefore && leadingSpaceString(element)) {
          return true
        }
      }
      if (index < lastIndex) {
        var elementAfter = list[index + 1]
        var childAfter = looksLikeAChild(elementAfter)
        if (childAfter && terminalSpaceString(element)) {
          return true
        }
      }
      return false
    }
  })
}

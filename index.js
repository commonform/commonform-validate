/* Copyright 2015 Kyle E. Mitchell
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you
 * may not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var array = require('is-array')
var contiguous = require('contiguous')
var object = require('is-object')
var string = require('is-string')
var tlds = require('tlds')
var revedParse = require('reviewers-edition-parse')

var ALL_LOWER_ALPHA = /^[a-z]+$/

var ASCII_TLDS = tlds.filter(function (tld) {
  return ALL_LOWER_ALPHA.test(tld)
})

var keyCount = function (argument) {
  return Object.keys(argument).length
}

var hasProperty = function (argument, key, predicate) {
  return (
    argument.hasOwnProperty(key) &&
    predicate(argument[key])
  )
}

var text = (function () {
  var ASCII_PRINTABLE_RE = /^[\x20-\x7E]*$/

  return function (argument) {
    return (
      string(argument) &&
      argument.length > 0 &&
      argument.indexOf('  ') < 0 &&
      ASCII_PRINTABLE_RE.test(argument)
    )
  }
})()

var term = function (argument) {
  return (
    text(argument) &&
    argument[0] !== ' ' &&
    argument[argument.length - 1] !== ' '
  )
}

var simpleObject = function (permittedKey) {
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

var blank = exports.blank = function (argument) {
  return (
    object(argument) &&
    keyCount(argument) === 1 &&
    hasProperty(argument, 'blank', isEmptyString) &&
    true
  )
}

var form

var child = exports.child = function (argument, options) {
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

var component = exports.component = function (argument) {
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

var content = exports.content = function (argument, options) {
  var predicates = [blank, child, definition, reference, text, use]
  if (options && options.allowComponents) {
    predicates.push(component)
  }
  return predicates.some(function (predicate) {
    return predicate(argument, options)
  })
}

form = exports.form = (function () {
  var leadingSpaceString = function (argument) {
    return (
      string(argument) &&
      argument[0] === ' '
    )
  }

  var terminalSpaceString = function (argument) {
    return (
      string(argument) &&
      argument[argument.length - 1] === ' '
    )
  }

  var looksLikeAChild = function (argument) {
    return (
      argument.hasOwnProperty('form') ||
      argument.hasOwnProperty('repository')
    )
  }

  var spaceAbuttingChild = function (elements) {
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

  return function (argument, options) {
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
})()

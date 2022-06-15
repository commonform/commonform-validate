var array = require('is-array')
var contiguous = require('contiguous')
var has = require('has')
var object = require('is-object')
var string = require('is-string')

var VERSION_RE = new RegExp('^' + require('legal-versioning-regexp') + '$')

// The following regular expression was adapted from
// https://gist.github.com/dperini/729294
//
// Copyright (c) 2010-2018 Diego Perini (http://www.iport.it)
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
var HTTPS_URL_RE = /^(?:https):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu

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
      hasProperty(argument, 'component', function (value) {
        return HTTPS_URL_RE.test(value)
      }) &&
      hasProperty(argument, 'version', function (value) {
        return VERSION_RE.test(value)
      }) &&
      hasProperty(argument, 'substitutions', function (value) {
        return (
          object(value) &&
          hasProperty(value, 'terms', termMapping) &&
          hasProperty(value, 'headings', termMapping) &&
          hasProperty(value, 'blanks', function (blanks) {
            return (
              Object.keys(blanks).every(function (key) {
                var parsed = parseInt(key)
                return !isNaN(parsed) && parsed > 0
              }) &&
              Object.values(blanks).every(function (value) {
                return typeof value === 'string'
              })
            )
          }) &&
          keyCount(value) === 3
        )
      })
    ) &&
    (
      keyCount(argument) === 3 ||
      (
        keyCount(argument) === 4 &&
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
    has(argument, 'component')
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

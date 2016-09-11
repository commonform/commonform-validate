```javascript
var valid = require('commonform-validate')
```

# Forms

## Simple Example

```javascript
var assert = require('assert')

assert(valid.form({content: ['A'], conspicuous: 'yes'}))
```

## No Additional Properties

```javascript
assert(!valid.form({content: ['A'], extra: false}))
```

## Plain Objects

```javascript
var invalidForm = function () {}
invalidForm.content = ['A']
assert(!valid.form(invalidForm))
```

## Content

```javascript
assert(!valid.form({content: 'A'}))

assert(!valid.form({content: []}))
```

Form content arrays cannot contain contiguous strings:

```javascript
assert(
  !valid.form({content: ['a', 'b']}),
  'forms cannot contain contiguous strings'
)
```

Or contiguous blanks:

```javascript
assert(
  !valid.form({content: [{blank: ''}, {blank: ''}]}),
  'forms cannot contain contiguous blanks'
)
```
Nor can they contain empty strings:

```javascript
assert(
  !valid.form({content: ['']}),
  'forms cannot contain empty strings'
)
```

If the first element of `content` is a string, it can't start with space:

```javascript
assert(!valid.form({content: [' a']}))
```

Nor can a final string element end with space:

```javascript
assert(!valid.form({content: ['a ']}))
```

## Conspicuous

Forms that must be typeset conspicuously have a `conspicuous` property:

```javascript
assert(
  valid.form({
    content: ['A'],
    conspicuous: 'yes'
  }),
  'form "conspicuous" properties can be "yes"'
)
```
That property must have the string value `"yes"`. No other falsey values allowed:

```javascript
assert(!valid.form({content: ['B'], conspicuous: true}))

assert(!valid.form({content: ['A'], conspicuous: null}))
```

# Form Content Objects

Form content arrays can contain a variety of objects:

```javascript
assert(
  valid.form({
    content: [
      'Any dispute or controversy arising under or in connection ' +
      'with this ', {use: 'Agreement'}, ' shall be settled ' +
      'exclusively by arbitration in the ',
      {blank: ''}, ', in accordance with the ' +
      'applicable rules of the American Arbitration Association ' +
      'then in effect.'
    ]
  }),
  'valid forms include the real-world example'
)
```

## Blanks

```javascript
assert(valid.blank({blank: ''}))
```

## Definitions

```javascript
assert(valid.definition({definition: 'A'}))
```

## References

```javascript
assert(valid.reference({reference: 'A'}))
```

## Uses

```javascript
assert(valid.use({use: 'A'}))
```

## Children

Children allow forms to contain other forms, with optional headings:

```javascript
assert(valid.child({form: {content: ['A']}}))

assert(valid.child({heading: 'A', form: {content: ['B']}}))

var invalidChild = function () {}
invalidChild.form = {content: ['A']}
assert(!valid.child(invalidChild))
```

Any text surrounding a child form can't run up to it with space:

```javascript
assert(
  !valid.form({
    content: [
      'this is a space -> ',
      {form: {content: ['A']}}
    ]
  })
)

assert(
  !valid.form({
    content: [
      {form: {content: ['A']}},
      ' <- that was a space'
    ]
  })
)
```

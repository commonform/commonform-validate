# commonform-validate

validate Objects against [Common Form](https://commonform.github.io)'s
core schema for legal language

_If you're looking to get into Common Form, this `README` is the place
to start.  The schema enforced by this package allows all the rest of the
pieces of Common Form to communicate contract language in a uniform way._

Common Form represents legal forms, and pieces of legal forms, as
objects following a single, strict schema.  This package exports a
function, `validate.form(object)` that returns `true` if `object`
follows that schema.

The schema embodies a number of rules, demonstrated by examples in
this `README`.  The same examples serve as test suite for the package,
using the `assert` module:

```javascript
var assert = require('assert')
```

The goals of the schema's rules are:

1.  Given a copy of a piece of legal language, perhaps in print or
    another format, it should be clear how to encode that language
    as a valid form object.

2.  There should be exactly one way to encode any given piece of
    legal language as a valid form object.

Neither of these goals is entirely achievable, but the rules make
meaningful progress.  Together, they serve the overarching goal of
forcing the encoding of exactly the same legal language in exactly the
same data.  Other Common Form software [consistently serializes those
objects][serialize] and [consistently hashes the serializations][hash].
As a result, Common Form can use cryptographic hashes to identify
legal language.

[serialize]: https://www.npmjs.com/package/commonform-serialize

[hash]: https://www.npmjs.com/package/commonform-hash

For example:

> _Any dispute or controversy arising under this Agreement (a "Dispute") shall
> be resolved exclusively by arbitration under Section 12 (Arbitration Rules)
> in either: (i) New York City; or (ii) Chicago, Illinois._

Becomes:

```javascript
var validate = require('commonform-validate')

assert(
  validate.form(
    {
      content: [
        'Any dispute or controversy arising under this ',
        { use: 'Agreement' },
        ' (a ',
        { definition: 'Dispute' },
        ') shall be resolved exclusively by arbitration under ',
        { reference: 'Arbitration Rules' },
        ' in either:',
        {
          form: {
            content: [
              'New York City; or'
            ]
          }
        },
        {
          form: {
            content: [
              'Chicago, Illinois.'
            ]
          }
        }
      ],
      conspicuous: 'yes'
    }
  )
)
```

# Content

The most important property of a form object is `content`, whose value
must be an array.  The array holds the content of the form object as
its elements.

The `content` array cannot be empty.  It must contain at least one valid
element:

```javascript
assert(
  !validate.form({
    content: []
  })
)
```

## Strings

Most text content is represented by strings:

```javascript
assert(
  validate.form(
    {
      content: [
        'New York City'
      ]
    }
  )
)
```

Even if a form contains just a single string, `content` must be
an array:

```javascript
assert(
  !validate.form(
    {
      content: 'New York City'
    }
  )
)
```

Strings in `content` may use only these specific characters:

- digits `0` through `9`
- letters `A` `Z` and `a` through `z`
- (space)
- punctuation marks `!` `"` `'` `(` `)` `,` (comma) `.` (period) `&` `/` `:` `;` `?` `[` `\` `]` ` (backtick)
- math symbols `*` `+` `<` `=` `>` `-` `%`
- other symbols `@` `_` (underscore) `$` `^` `{` `|` `}` `~` `#`

This list notably _excludes_:

- typographers' quotation marks, like `“` and `’`
- long dashes, like `–` (en-dash) and `—` (em-dash)
- `§`, `¶`

Other Common Form software, like
[commonform.org](https://commonform.org), tries its best to display
quotation marks—valid data—as curly quotes—not allow as data,
but much nicer to read—and so on.  In the underlying data, however,
allowing both `"` (straight double quote) and `“` (left double quote)
with `”` (right double quote), would make it easy to concoct two
valid form objects with the same content:

```javascript
assert(
  validate.form(
    {
      content: [
        'The product comes "as is".'
      ]
    }
  )
)

assert(
  !validate.form(
    {
      content: [
        'The product comes “as is”.'
      ]
    }
  )
)
```

Strings cannot appear next to one another in `content` arrays:

```javascript
assert(
  !validate.form(
    {
      content: [
        'The parties will litigate ',
        'in San Francisco.'
      ]
    }
  )
)
```

Use one string instead:

```javascript
assert(
  validate.form(
    {
      content: [
        'The parties will litigate in San Francisco.'
      ]
    }
  )
)
```

If the first element of `content` is a string, that string cannot
start with a space:

```javascript
assert(
  !validate.form(
    {
      content: [
        ' The parties will litigate in San Francisco.'
      ]
    }
  )
)
```

Nor can a final string element end with space:

```javascript
assert(
  !validate.form(
    {
      content: [
        'The parties will litigate in San Francisco. '
      ]
    }
  )
)
```

## Definitions

Definitions mark words and phrases that will be used with specific
meaning elsewhere:

```javascript
assert(
  validate.definition(
    { definition: 'Applicable Law' }
  )
)
```

For example:

```javascript
assert(
  validate.form(
    {
      content: [
        { definition: 'Securities Act' },
        ' means the Securities Act of 1933.'
      ]
    }
  )
)
```

```javascript
assert(
  validate.form(
    {
      content: [
        'The ',
        { definition: 'Purchase Price' },
        ' is $1.00.'
      ]
    }
  )
)
```

## Uses

Uses mark terms defined elsewhere:

```javascript
assert(
  validate.use(
    { use: 'Subject Assets' }
  )
)
```

The string value in the use object should match the string value in
a corresponding definition object exactly.

For example:

```javascript
assert(
  validate.form(
    {
      content: [
        { use: 'Purchaser' },
        ' will place the ',
        { use: 'Subject Assets' },
        ' in escrow.'
      ]
    }
  )
)
```

## Blanks

Blanks represent empty spaces in a form to fill in later:

```javascript
assert(
  validate.blank(
    { blank: '' }
  )
)
```

For example:

```javascript
assert(
  validate.form(
    {
      content: [
        'The purchase price is ',
        { blank: '' },
        '.'
      ]
    }
  )
)
```

Blanks are vital for keeping confidential information, like
the identities of parties to a specific contract, or details like
purchase prices and descriptions of waived claims, out of form objects.
Other software under the Common Form umbrella automates the process of
filling in blanks with confidential details, which can and should be
kept separate from data about the generic language of form contracts.

The value of the `blank` property must be an empty string:

```javascript
assert(
  !validate.blank(
    { blank: '$10' }
  )
)
```

Blanks cannot appear next to one another in `content` arrays:

```javascript
assert(
  !validate.form(
    {
      content: [
        'The parties will litigate this contract only in ',
        { blank: '' },
        { blank: '' },
        '.'
      ]
    }
  )
)
```

Use a single blank instead:

```javascript
assert(
  validate.form(
    {
      content: [
        'The parties will litigate this contract only in ',
        { blank: '' },
        '.'
      ]
    }
  )
)
```

## References

References refer to other parts of a form by heading:

```javascript
assert(
  validate.reference(
    { reference: 'Payment Terms' }
  )
)
```

For example:

```javascript
assert(
  validate.form(
    {
      content: [
        'The escrow will be managed pursuant to ',
        { reference: 'Escrow Procedure' },
        '.'
      ]
    }
  )
)
```

## Links

Links refer to a URL or other World Wide Web resource.

```javascript
assert(
  validate.link(
    { link: 'https://example.com/' }
  )
)
```

For example:

```javascript
assert(
  validate.form(
    {
      content: [
        'These terms incorporate the security requirements at ',
        { link: 'https://example.com/security' },
        '.'
      ]
    }
  )
)
```

## Children

Children allow forms to contain other forms, with optional headings:

```javascript
assert(
  validate.child(
    {
      form: {
        content: [
          'Text in the child form.'
        ]
      }
    }
  )
)

assert(
  validate.child(
    {
      heading: 'Warranty Disclaimer',
      form: {
        content: [
          'The software comes without warranty, express or implied.'
        ],
        conspicuous: 'yes'
      }
    }
  )
)
```

Child forms represent any structure where one reusable piece of language appears
within another.  Sections within articles.  Subsections within sections.
Itemized lists within sections:

```javscript
assert(
  validate.form(
    {
      content: [
        { use: 'Confidential Information' },
        ' does not include:',
        {
          form: {
            content: [
              'public information'
            ]
          }
        },
        {
          form: {
            content: [
              'information received from others'
            ]
          }
        },
        {
          form: {
            content: [
              'independent developments'
            ]
          }
        }
      ]
    }
  )
)
```

Strings surrounding a child element cannot run up to the child element
with space:

```javascript
assert(
  !validate.form(
    {
      content: [
        'this is a space -> ',
        {
          form: {
            content: ['child form text']
          }
        }
      ]
    }
  )
)

assert(
  !validate.form(
    {
      content: [
        {
          form: {
            content: ['child form text']
          }
        },
        ' <- that was a space'
      ]
    }
  )
)
```

## Components

The validation routine optionally permits components.  Components incorporate children by reference.

```javascript
var validComponent = {
  component: 'https://commonform.org/kemitchell/orthodox-software-copyright-license',
  version: '1.0.0',
  substitutions: {
    terms: {
      Licensor: 'Vendor',
      Licensee: 'Customer',
      Program: 'Software'
    },
    headings: {
      'Express Warranties': 'Guarantees'
    },
    blanks: {
      1: 'United States'
    }
  }
}

assert(validate.component(validComponent))

assert(
  validate.component(
    Object.assign({}, validComponent, { heading: 'Copyright License' })
  )
)

assert(
  !validate.component(
    Object.assign({}, validComponent, { extra: 'property' })
  )
)

assert(
  validate.form(
    { content: [validComponent] },
    { allowComponents: true }
  )
)

assert(
  !validate.form(
    { content: [validComponent] }
    // Do not allow components.
  )
)
```

Strings surrounding a component cannot run up to the component
with space:

```javascript
assert(
  !validate.form(
    {
      content: [
        'this is a space -> ',
        validComponent
      ]
    },
    { allowComponents: true }
  )
)

assert(
  !validate.form(
    {
      content: [
        validComponent,
        ' <- that was a space'
      ]
    },
    { allowComponents: true }
  )
)
```

# Conspicuous Provisions

Forms that must be typeset conspicuously have a `conspicuous` property
whose value is the string `'yes'`:

```javascript
assert(
  validate.form(
    {
      content: [
        'Damages will be limited to $10.'
      ],
      conspicuous: 'yes'
    }
  )
)
```
No other values are allowed:

```javascript
assert(
  !validate.form(
    {
      content: [
        'Damages will be limited to $10.'
      ],
      conspicuous: true
    }
  )
)

assert(
  !validate.form(
    {
      content: [
        'Damages will be limited to $10.'
      ],
      conspicuous: null
    }
  )
)
```

# No Additional Properties

Apart from `content` and optionally `conspicuous`, form objects may
not have any other properties.

```javascript
assert(
  !validate.form(
    {
      content: [
        'There are no third-party beneficiaries.'
      ],
      extra: false
    }
  )
)
```

Nor may content elements:

```javascript
assert(
  !validate.definition({
    definition: 'Purchase Price',
    other: 'property'
  })
)

assert(
  !validate.definition({
    use: 'Purchase Price',
    plural: false
  })
)

assert(
  !validate.definition({
    reference: 'Termination',
    underline: 'dashed'
  })
)

assert(
  !validate.definition({
    blank: '',
    placeholder: 'three weeks'
  })
)
```

# Plain Objects

In JavaScript, almost everything is an object.  Form and content
objects must be constructed with `{}` literal syntax or `new Object()`.
Not functions or other types with the right properties set.

```javascript
var invalidForm = function () {}
invalidForm.content = [
  'Example string content.'
]
assert(
  !validate.form(invalidForm)
)
```

```javascript
var invalidChild = function () {}
invalidChild.form = {
  content: [
    'Example string content.'
  ]
}
assert(
  !validate.child(invalidChild)
)
```

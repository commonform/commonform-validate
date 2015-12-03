This package is the core of the Common Form project. You can use the functions it exports to tell whether a JavaScript Object is a valid Common Form. Valid Common Form objects represent reusable units of contract text.

If the function exported as `form` returns `true` for an Object passed to it, that Object is a valid Common Form. If it returns `false`, that Object is not a valid Common Form.

```javascript
var valid = require('commonform-validate')
```

The examples in this README are the package's test suite. They use the Node.js core [`assert` module](https://nodejs.org/api/assert.html).

```javascript
var assert = require('assert')
```

If you're not familiar with `assert`, it works like so:

```javascript
assert(
  true,           // If this argument is not a "true-like" or "truthy"
                  // value in JavaScript, assert will throw an error.
  'true is true'  // (optional) If assert has to throw an error, the
                  // error will have this argument as its message.
)
```

# Common Forms

American contract drafters tend to think of their contracts as being made of several different kinds of pieces. For example, a contract may be made of articles, sections, subsections, paragraphs, and subparagraphs.

Common Forms represent all of those kinds of contract pieces. In fact, any reusable unit of contract text corresponds to a Common Form. The trick is that Common Forms may contain other Common Forms, which in turn contain others, and so on.

You can think of Common Forms as folders for pieces of contracts. Consider a contract that is organized into "articles", each of which has one or more "parts" that in turn contain "sections". You write each section on its own sheet of paper and place it into its own separate folder. For each part, you create a new folder, and place all the folders for the sections it contains inside. Then you create a folder for each article, and place all the folders for the parts it contains inside. Finally, you put all of the articles folders into one large folder, for the contract as a whole.

Each folder corresponds to a Common Form. You can rearrange the folders as you see fit. You can throw folders out, or exchange them for new ones from a different contract. Perhaps you take a folder for a section and place it at the very back of the folder for the whole contract, turning it into an "article" of its own. It's just folders until you write out the language held inside as a contract.

Technically speaking, Common Forms are recursive data structures composed entirely of Objects, Arrays, and Strings of ASCII printable characters. There are no Numbers, `true`, `false`, or `null` values in valid Common Forms.

## Simple Example

The simplest Common Forms contain only text. Imagine a very short section of a franchising agreement that reads:

> Puerto Rico is considered part of the United States.

That short section corresponds to the Common Form:

```javascript
assert(
  valid.form({
    content: [ 'Puerto Rico is considered part of the United States.' ] }))
```

Each Common Form contains a `content` property, whose value is an Array. Simple text is contained in strings within the `content` Array.

## Other Kinds of Content

`content` Arrays can contain a few other kinds of values.

```javascript
assert(
  valid.form({
    content: [
      'Any dispute or controversy arising in connection with this ',
      { use: 'Agreement' },
      ' shall be settled exclusively by arbitration in ',
      { blank: '' },
      ' (the ',
      { definition: 'Forum' },
      ') in accordance with ',
      { reference: 'Arbitration Procedures' },
      '.' ] }))
```

Which in the context of a contract might look like:

> Any dispute or controversy arising in connection with this Agreement shall be settled exclusively by arbitration in \[•\] (the "_Forum_") in accordance with Section 10.4 (Arbitration Procedures).

### Blanks

Blanks are places in a Common Form where the drafter of a contract should fill in additional information. For example:

> "_Purchase Price_" means [•].

Becomes:

```javascript
assert(
  valid.form({
    content: [
      { definition: 'Purchase Price' },
      ' means ',
      { blank: '' } ] }))
```

Note that all Common Form blanks look the same:

```javascript
assert(valid.blank({ blank: '' }))
```

### Definitions

Definitions are words given a specific meaning throughout a contract. American contract drafters often write definitions like "Buyer" in the following excerpt:

> ... NewCo, Inc., a Delaware corporation ("_Buyer_") ...

In Common Form, "Buyer" above is:

```javascript
assert(valid.definition({ definition: 'Buyer' }))
```

As in:

```javascript
assert(
  valid.form({
    content: [
      'NewCo, Inc., a Delaware corporation (',
      { definition: 'Buyer' },
      ')' ] }))

assert(
  valid.form({
    content: [
      { definition: 'Buyer' },
      'means NewCo, Inc., a Delaware corporation.' ] }))
```

### Uses

When a term is used in a contract with the expectation that it is defined elsewhere, write:

```javascript
assert(valid.use({ use: 'Buyer' }))
```

As in:

```javascript
assert(
  valid.form({
    content: [ { use: 'Buyer' }, ' shall pay ...' ] }))
```

### Children

Common Forms may contain other Common Forms. This empowers Common Forms to describe all the pieces contracts are made of.

```javascript
assert(valid.child({ form: { content: [ 'A' ] } }))
```

Children may also have headings. Consider this contract structure:

> Article X
>
> 10.1\. _Indemnification by Buyer_. ...
>
> 10.2\. _Indemnification by Seller_. ...
>
> 10.3\. _Indemnification Procedure_. ...

As a Common Form:

```javascript
assert(
  valid.form({
    content: [
      { heading: "Indemnification by Buyer",
        form: { content: [ "..." ] } },
      { heading: "Indemnification by Seller",
        form: { content: [ "..." ] } },
      { heading: "Indemnification Procedure",
        form: { content: [ "..." ] } } ] }))
```

## References

Sometimes text in one subdivision cross-references text in another subdivision. In Common Forms, all references point to headings. A cross reference like this:

> ... shall be entitled to indemnification pursuant to _Section 10.3_ (Indemnification Procedure) ...

Becomes:

```javascript
assert(valid.reference({ reference: 'Indemnification Procedure' }))
```

## Conspicuous Text

Some pieces of contract text must be typeset "conspicuously" to have legal effect. Disclaimers of implied warranties under the Uniform Commercial Code are a common example.

Common Forms that must be typeset conspicuously have a `conspicuous` property:

```javascript
assert(
  valid.form({
    content: [ 'A' ],
    conspicuous: 'yes' }),
  'form "conspicuous" properties can be "yes"')
```
`conspicuous` properties must have the string value `"yes"`. No other values are allowed:

```javascript
assert(
  !valid.form({
    content: [ 'A' ],
    conspicuous: true }),
  '`true` is not a valid `conspicuous` propety')

assert(
  !valid.form({
    content: [ 'A' ],
    conspicuous: null }),
  '`null` is not a valid `conspicuous` propety')
```

## No Additional Properties

Apart from a valid `content` Array and possibly a `conspicuous` property, Common Forms cannot have any additional properties:

```javascript
assert(
  !valid.form({
    content: [ 'A' ],
    extra: false }))
```

## Content Arrays

As previously mentioned, Common Forms must have `content` properties with Array values. `content` Arrays must contain at least one valid value.

```javascript
assert(!valid.form({ content: 'A' }))

assert(!valid.form({ content: [  ] }))
```

There are a few additional rules about values within `content` Arrays. Most of these rules are designed to prevent more than one Common Forms structure from validly representing exactly the same content.

```javascript
assert(
  !valid.form({ content: [ 'a', 'b' ] }),
  'forms cannot contain contiguous strings')
```

Without this rule, both `{"content":["a","b"]}` and `{"content":["ab"]}` would be valid Common Forms.

```javascript
assert(
  !valid.form({ content: [ { blank: '' }, { blank: '' } ] }),
  'forms cannot contain contiguous blanks')
```

Without this rule, any number of valid valid Common Forms could mean the same as "_Company_ means [•]".

```javascript
assert(
  !valid.form({ content: [ '' ] }),
  'forms cannot contain empty strings')
```

If the first element of `content` is text, it can't start with space.

```javascript
assert(
  !valid.form({ content: [ ' a' ] }),
  'leading text cannot start with space')
```

Nor can text at the end of a Common Form end with space:

```javascript
assert(
  !valid.form({ content: [ 'a ' ] }),
  'final text cannot end with space')
```

Lastly, any text surrounding a child form can't run up to the child with space:

```javascript
assert(
  !valid.form(
  { content: [
      'this is a space -> ',
      { form: { content: [ 'A' ] } } ] }),
  'text before a child cannot end with space')

assert(
  !valid.form(
  { content: [
      { form: { content: [ 'A' ] } },
       ' <- that was a space' ] }),
  'text after a child cannot end with space')
```

## Plain Objects

In JavaScript, Common Forms must be "plain objects".

```javascript
var f = function() {  }
f.content = [ 'A' ]
assert(!valid.form(f))
```

So must children:

```javascript
var f = function() {  }
f.form = { content: [ 'A' ] }
assert(!valid.child(f))
```

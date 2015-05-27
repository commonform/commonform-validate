var test = require('tape');
var validate = require('..');

test('References', function(test) {
  test.ok(
    validate.reference({reference: 'A'}),
    'references have "reference"');

  test.end();
});

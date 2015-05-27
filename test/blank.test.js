var test = require('tape');
var validate = require('..');

test('Blanks', function(test) {
  test.ok(
    validate.blank({blank: 'A'}),
    'blanks have "blank"');

  test.end();
});

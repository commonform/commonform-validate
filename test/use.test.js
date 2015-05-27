var test = require('tape');
var validate = require('..');

test('Uses', function(test) {
  test.ok(
    validate.use({use: 'A'}),
    'uses have "use"');

  test.end();
});

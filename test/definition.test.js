var test = require('tape');
var validate = require('..');

test('Definitions', function(test) {
  test.ok(
    validate.definition({definition: 'A'}),
    'definitions have "definition"');

  var f = function() {};
  f.definition = 'A';
  test.notOk(
    validate.definition(f),
    'definitions are plain objects');

  test.end();
});

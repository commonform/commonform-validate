var test = require('tape');
var validate = require('..');

test('Children', function(test) {
  test.ok(
    validate.child({heading: 'A', form: {content: ['B']}}),
    'children have "heading" and "form"');

  test.ok(
    validate.child({form: {content: ['A']}}),
    'children can omit "heading"');

  var f = function() {};
  f.form = {content: ['A']};
  test.notOk(
    validate.child(f),
    'children are plain objects');

  test.end();
});

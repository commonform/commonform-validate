var test = require('tape');
var validate = require('..');

test('Forms', function(test) {
  test.ok(
    !validate.form({}),
    'forms have "content"');

  test.ok(
    validate.form({content: ['A'], conspicuous: 'yes'}),
    'forms may have "conspicuous"');

  test.ok(
    !validate.form({content: ['A'], extra: false}),
    'forms have no extra properties');

  var f = function() {};
  f.content = ['A'];
  test.ok(
    !validate.form(f),
    'forms are plain objects');

  test.ok(
    !validate.form({content: 'A'}),
    'form "content" is an array');

  test.ok(
    !validate.form({content: []}),
    'form "content" cannot be empty');

  test.ok(
    !validate.form({content: ['a', 'b']}),
    'forms cannot contain contiguous strings');

  test.ok(
    !validate.form({content: ['']}),
    'forms cannot contain empty strings');

  test.ok(
    !validate.form({content: [' a']}),
    'form content cannot start with space');

  test.ok(
    !validate.form({content: ['a ']}),
    'form content cannot end with space');

  test.ok(
    validate.form({content: ['A'], conspicuous: 'yes'}),
    'form "conspicuous" properties can be "yes"');

  test.ok(
    !validate.form({content: ['B'], conspicuous: true}),
    'form "conspicuous" properties cannot be (boolean) true');

  test.ok(
    !validate.form({content: ['A'], conspicuous: null}),
    'form "conspicuous" properties cannot be null');

  test.ok(
    validate.form({
      content: [
        'Any dispute or controversy arising under or in connection ' +
        'with this ', {use: 'Agreement'}, ' shall be settled ' +
        'exclusively by arbitration in the ',
        {blank: 'Arbitration Venue'}, ', in accordance with the ' +
        'applicable rules of the American Arbitration Association ' +
        'then in effect.'
      ]
    }),
    'valid forms include the real-world example');

  test.end();
});

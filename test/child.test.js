/* jshint mocha: true */
var expect = require('chai').expect;
var validate = require('..');

var child = {
  content: ['Child text']
};

describe('Children', function() {
  it('can contain "heading" and "form" properties', function() {
    expect(
      validate.child({
        heading: 'Indemnification',
        form: child
      })
    ).to.equal(true);
  });

  it('can omit "heading"', function() {
    expect(
      validate.child({form: child})
    ).to.equal(true);
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.form = child;
    expect(
      validate.child(f)
    ).to.equal(false);
  });
});

/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validate = require('..');

var DIGEST = new Array(65).join('a');

describe('Children', function() {
  it('can contain "heading" and "digest" properties', function() {
    expect(
      validate.child({
        heading: 'Indemnification',
        digest: DIGEST
      })
    ).to.equal(true);
  });

  it('can omit "summarize"', function() {
    expect(validate.child({digest: DIGEST})).to.equal(true);
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.digest = DIGEST;
    expect(validate.child(f)).to.equal(false);
  });
});

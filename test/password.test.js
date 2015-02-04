/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Passwords', function() {
  it('cannot be trivial', function() {
    expect(validation.password('1234'))
      .to.be.false();
  });

  it('can be passphrases', function() {
    expect(validation.password('mine hearties do program lisp'))
      .to.be.true();
  });
});

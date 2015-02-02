/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Passwords', function() {
  it('cannot be trivial', function() {
    expect(validation.isPassword('1234'))
      .to.be.false();
  });

  it('can be passphrases', function() {
    expect(validation.isPassword('mine hearties do program lisp'))
      .to.be.true();
  });
});

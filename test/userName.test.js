/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('User name', function() {
  it('rejects short names', function() {
    expect(validation.userName('a'))
      .to.be.false();
  });

  it('accepts a valid example', function() {
    expect(validation.userName('kemitchell'))
      .to.be.true();
  });
});

describe('Reserved User Name', function() {
  it('accepts "anonymous"', function() {
    expect(validation.reservedUserName('anonymous'))
      .to.be.true();
  });

  it('accepts "librarian"', function() {
    expect(validation.reservedUserName('anonymous'))
      .to.be.true();
  });

  it('rejects "kemitchell"', function() {
    expect(validation.reservedUserName('kemitchell'))
      .to.be.false();
  });
});

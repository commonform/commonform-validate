/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('User name', function() {
  it('rejects short names', function() {
    expect(validation.isUserName('a'))
      .to.be.false();
  });

  it('accepts a valid example', function() {
    expect(validation.isUserName('kemitchell'))
      .to.be.true();
  });
});

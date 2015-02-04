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

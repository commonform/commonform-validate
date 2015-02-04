/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Preferences', function() {
  it('does not permit numeric properties', function() {
    expect(validation.preferences({key: 1}))
      .to.be.false();
  });

  it('does not permit boolean properties', function() {
    expect(validation.preferences({key: true}))
      .to.be.false();
  });

  it('permits nested arrays and objects', function() {
    expect(validation.preferences({key: [{key: 'string'}]}))
      .to.be.true();
  });

  it('permits empty arrays and objects', function() {
    expect(validation.preferences({key: [{}, []]}))
      .to.be.true();
  });
});

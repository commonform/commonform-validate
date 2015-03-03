/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Fields', function() {
  it('include a single property, "field"', function() {
    expect(validation.field(Immutable.Map({field: 'Interest Rate'})))
      .to.be.true();
  });
});

/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('References', function() {
  it('contain a single property, "reference"', function() {
    expect(
      validation.reference(Immutable.fromJS({reference: 'Liability'}))
    ).to.be.true();
  });
});

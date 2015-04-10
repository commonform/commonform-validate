/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('References', function() {
  it('contain a single property, "reference"', function() {
    expect(validation.reference({reference: 'Payment'})).to.equal(true);
  });
});

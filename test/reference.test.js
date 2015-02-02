/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('References', function() {
  it('contain a single property, "reference"', function() {
    expect(validation.isReference({reference: 'Liability'}))
      .to.be.true();
  });
});

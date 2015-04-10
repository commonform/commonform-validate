/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validate = require('..');

describe('Blanks', function() {
  it('include a single property, "blank"', function() {
    expect(
      validate.blank(Immutable.Map({blank: 'Interest'}))
    ).to.be.true();
  });
});

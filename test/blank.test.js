/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validate = require('..');

describe('Blanks', function() {
  it('include a single property, "blank"', function() {
    expect(validate.blank({blank: 'Interest'})).to.equal(true);
  });
});

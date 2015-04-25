/* jshint mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Use', function() {
  it('contain a single property, "use"', function() {
    expect(validation.use({use: 'Consideration'})).to.equal(true);
  });
});

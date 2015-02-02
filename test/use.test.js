/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Use', function() {
  it('contain a single property, "use"', function() {
    expect(validation.isUse({use: 'Merger Consideration'}))
      .to.be.true();
  });
});

/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Use', function() {
  it('contain a single property, "use"', function() {
    expect(validation.use(Immutable.Map({use: 'Merger Consideration'})))
      .to.be.true();
  });
});

/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Definitions', function() {
  it('contain a single property, "definition"', function() {
    expect(validation.isDefinition({definition: 'Consideration'}))
      .to.be.true();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.definition = 'Merger Consideration';
    expect(validation.isDefinition(f))
      .to.be.false();
  });
});

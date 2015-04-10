/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Definitions', function() {
  it('contain a single property, "definition"', function() {
    expect(validation.definition({definition: 'Cash'})).to.equal(true);
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.definition = 'Merger Consideration';
    expect(validation.definition(f)).to.be.false();
  });
});

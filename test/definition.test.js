/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Definitions', function() {
  it('contain a single property, "define"', function() {
    expect(validation.definition(
      Immutable.fromJS({define: 'Consideration'})
    ))
      .to.be.true();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.define = 'Merger Consideration';
    expect(validation.definition(f))
      .to.be.false();
  });
});

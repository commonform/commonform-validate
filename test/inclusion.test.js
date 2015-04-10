/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

var DIGEST = new Array(65).join('a');

describe('Inclusions', function() {
  it('can contain "summarize" and "include" properties', function() {
    expect(validation.inclusion(Immutable.fromJS({
      summarize: 'Indemnification',
      include: DIGEST
    })))
      .to.be.true();
  });

  it('can omit "summarize"', function() {
    expect(validation.inclusion(Immutable.fromJS({include: DIGEST})))
      .to.be.true();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.definition = 'Merger Consideration';
    expect(validation.definition(f))
      .to.be.false();
  });
});

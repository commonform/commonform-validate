/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Sub-forms', function() {
  it('can contain "summary" and "form" properties', function() {
    expect(validation.subForm(Immutable.fromJS({
      summary: 'Indemnification',
      form: new Array(65).join('a')
    })))
      .to.be.true();
  });

  it('can omit "summary"', function() {
    expect(validation.subForm(Immutable.fromJS({
      form: new Array(65).join('a')
    })))
      .to.be.true();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.definition = 'Merger Consideration';
    expect(validation.definition(f))
      .to.be.false();
  });
});

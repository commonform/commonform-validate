/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Insertions', function() {
  it('include a single property, "insert"', function() {
    expect(validation.insertion(Immutable.Map({insert: 'Interest'})))
      .to.be.true();
  });
});

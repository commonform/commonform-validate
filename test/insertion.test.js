/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Insertions', function() {
  it('include a single property, "insertion"', function() {
    expect(validation.insertion(Immutable.Map({insertion: 'Interest'})))
      .to.be.true();
  });
});

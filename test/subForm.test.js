/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Sub-forms', function() {
  it('contain "summary" and "form" properties', function() {
    expect(validation.isSubForm({
      summary: 'Indemnification',
      form: new Array(65).join('a')
    }))
      .to.be.true();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.isDefinition = 'Merger Consideration';
    expect(validation.isDefinition(f))
      .to.be.false();
  });
});

/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');
var packageJSON = require('../package.json');

describe('Projects', function() {
  it('validates an example', function() {
    expect(validation.isProject({
      commonform: packageJSON.version,
      metadata: {title: 'Sample Project'},
      form: {content:[{field: 'Company Name'}]},
      values: {'Company Name': 'Someco, Inc'},
      preferences: {
        lint: 'false',
        numbering: 'AMOCD',
        typography: {quotes: 'true', dashes: 'false'}
      }
    }))
      .to.be.true();
  });
});

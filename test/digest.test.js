/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var hash = require('commonform-hash');
var validate = require('..');

describe('Digests', function() {
  it('are SHA-256 hex digests', function() {
    var digest = new Array(65).join('a');
    expect(validate.digest(digest)).to.equal(true);
  });

  it('are compatible with commonform-hash', function() {
    expect(validate.digest(hash({content: ['test']}))).to.equal(true);
  });
});

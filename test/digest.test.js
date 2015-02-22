/* jshint node: true, mocha: true */
var crypto = require('crypto');

var Immutable = require('immutable');
var expect = require('chai').expect;
var hash = require('commonform-hash');
var validate = require('..');

describe('Digests', function() {
  it('are SHA-256 hex digests', function() {
    var digest = crypto.createHash('sha256')
      .update('')
      .digest('hex');
    expect(validate.digest(digest))
      .to.be.true();
  });

  it('are compatible with commonform-hash', function() {
    var form = Immutable.fromJS({content: ['test']});
    expect(validate.digest(hash(form)))
      .to.be.true();
  });
});

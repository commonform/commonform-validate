/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Users', function() {
  it('accepts a valid example', function() {
    var user = {
      name: 'Kyle Mitchell',
      password: 'waxed hobbits missed eisengard',
      authorizations: ['read', 'write']
    };
    expect(validation.isUser(user))
      .to.be.true();
  });
});

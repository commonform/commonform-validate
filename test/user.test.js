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
    expect(validation.user(user))
      .to.be.true();
  });
});

describe('Anonymous User', function() {
  it('accepts a valid example', function() {
    expect(validation.anonymousUser({
      name: 'anonymous',
      authorizations: ['read']
    }))
      .to.be.true();
  });
});

describe('Librarian User', function() {
  it('accepts a valid example', function() {
    expect(validation.librarianUser({
      name: 'librarian',
      password: 'stray yahtzee miner harpsicord'

    }))
      .to.be.true();
  });
});

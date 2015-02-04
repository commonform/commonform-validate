/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validation = require('..');

describe('Forms', function() {
  it('must have .content', function() {
    expect(validation.form({}))
      .to.be.false();
  });

  it('may have .conspicuos', function() {
    expect(validation.form({content: ['Test'], conspicuous: 'true'}))
      .to.be.true();
  });

  it('cannot have other properties', function() {
    expect(validation.form({content: ['Test'], extra: false}))
      .to.be.false();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.content = ['Text'];
    expect(validation.form(f))
      .to.be.false();
  });

  describe('.content', function() {
    it('must be an array', function() {
      expect(validation.form({content: 'Test'}))
        .to.be.false();
    });

    it('cannot be empty', function() {
      expect(validation.form({content: []}))
        .to.be.false();
    });

    it('cannot contain contiguous strings', function() {
      expect(validation.form({content: ['a', 'b']}))
        .to.be.false();
    });

    it('cannot contain empty strings', function() {
      expect(validation.form({content: ['']}))
        .to.be.false();
    });

    it('cannot lead with a space', function() {
      expect(validation.form({content: [' text']}))
        .to.be.false();
    });

    it('cannot end with a space', function() {
      expect(validation.form({content: ['text ']}))
        .to.be.false();
    });
  });

  describe('.conspicuous', function() {
    it('can be "true"', function() {
      expect(validation.form({content: ['A'], conspicuous: 'true'}))
        .to.be.true();
    });

    it('cannot be (boolean) true', function() {
      expect(validation.form({content: ['B'], conspicuous: true}))
        .to.be.false();
    });

    it('cannot be null', function() {
      expect(validation.form({content: ['Test'], conspicuous: null}))
        .to.be.false();
    });
  });

  it('include the real-world example', function() {
    var form = {
      content: [
        'Any dispute or controversy arising under or in connect with ' +
        'this ', {use: 'Agreement'}, ' shall be settled exclusively ' +
        'by arbitration in the ', {field: 'Arbitration Venue'},
        ', in accordance with the applicable rules of the American ' +
        'Arbitration Association then in effect.'
      ]
    };
    expect(validation.form(form))
      .to.be.true();
  });
});

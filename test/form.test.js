/* jshint node: true, mocha: true */
var expect = require('chai').expect;
var validate = require('..');

describe('Forms', function() {
  it('must have .content', function() {
    expect(validate.form({})).to.equal(false);
  });

  it('may have .conspicuous', function() {
    expect(
      validate.form({
        content: ['Test'],
        conspicuous: 'yes'
      })
    ).to.equal(true);
  });

  it('cannot have other properties', function() {
    expect(
      validate.form({
        content: ['Test'],
        extra: false
      })
    ).to.equal(false);
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.content = ['Text'];
    expect(validate.form(f)).to.equal(false);
  });

  describe('.content', function() {
    it('must be an array', function() {
      expect(validate.form({content: 'Test'})).to.equal(false);
    });

    it('cannot be empty', function() {
      expect(validate.form({content: []})).to.equal(false);
    });

    it('cannot contain contiguous strings', function() {
      expect(validate.form({content: ['a', 'b']})).to.equal(false);
    });

    it('cannot contain empty strings', function() {
      expect(validate.form({content: ['']})).to.equal(false);
    });

    it('cannot lead with a space', function() {
      expect(validate.form({content: [' text']})).to.equal(false);
    });

    it('cannot end with a space', function() {
      expect(validate.form({content: ['text ']})).to.equal(false);
    });
  });

  describe('.conspicuous', function() {
    it('can be "yes"', function() {
      expect(
        validate.form({
          content: ['A'],
          conspicuous: 'yes'
        })
      ).to.equal(true);
    });

    it('cannot be (boolean) true', function() {
      expect(
        validate.form({
          content: ['B'],
          conspicuous: true
        })
      ).to.equal(false);
    });

    it('cannot be null', function() {
      expect(
        validate.form({
          content: ['Test'],
          conspicuous: null
        })
      ).to.equal(false);
    });
  });

  it('include the real-world example', function() {
    expect(
      validate.form({
        content: [
          'Any dispute or controversy arising under or in connection ' +
          'with this ', {use: 'Agreement'}, ' shall be settled ' +
          'exclusively by arbitration in the ',
          {blank: 'Arbitration Venue'}, ', in accordance with the ' +
          'applicable rules of the American Arbitration Association ' +
          'then in effect.'
        ]
      })
    ).to.equal(true);
  });
});

/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Forms', function() {
  it('must have .comprise', function() {
    expect(validation.form(Immutable.Map()))
      .to.be.false();
  });

  it('may have .emphasize', function() {
    expect(validation.form(Immutable.fromJS({
      comprise: ['Test'],
      emphasize: 'yes'
    })))
      .to.be.true();
  });

  it('cannot have other properties', function() {
    expect(validation.form(Immutable.fromJS({
      comprise: ['Test'],
      extra: false
    })))
      .to.be.false();
  });

  it('cannot be functions', function() {
    var f = function() {};
    f.comprise = ['Text'];
    expect(validation.form(f))
      .to.be.false();
  });

  describe('.comprise', function() {
    it('must be an array', function() {
      expect(validation.form(Immutable.fromJS({comprise: 'Test'})))
        .to.be.false();
    });

    it('cannot be empty', function() {
      expect(validation.form(Immutable.fromJS({comprise: []})))
        .to.be.false();
    });

    it('cannot contain contiguous strings', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: ['a', 'b']
      })))
        .to.be.false();
    });

    it('cannot contain empty strings', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: ['']
      })))
        .to.be.false();
    });

    it('cannot lead with a space', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: [' text']
      })))
        .to.be.false();
    });

    it('cannot end with a space', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: ['text ']
      })))
        .to.be.false();
    });
  });

  describe('.emphasize', function() {
    it('can be "yes"', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: ['A'],
        emphasize: 'yes'
      })))
        .to.be.true();
    });

    it('cannot be (boolean) true', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: ['B'],
        emphasize: true
      })))
        .to.be.false();
    });

    it('cannot be null', function() {
      expect(validation.form(Immutable.fromJS({
        comprise: ['Test'],
        emphasize: null
      })))
        .to.be.false();
    });
  });

  it('include the real-world example', function() {
    var form = Immutable.fromJS({
      comprise: [
        'Any dispute or controversy arising under or in connect with ' +
        'this ', {use: 'Agreement'}, ' shall be settled exclusively ' +
        'by arbitration in the ', {insert: 'Arbitration Venue'},
        ', in accordance with the applicable rules of the American ' +
        'Arbitration Association then in effect.'
      ]
    });
    expect(validation.form(form))
      .to.be.true();
  });
});

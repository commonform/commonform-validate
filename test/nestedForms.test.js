/* jshint node: true, mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var validation = require('..');

describe('Nested forms', function() {
  describe('real-world example', function() {
    var first = Immutable.fromJS({
      heading: 'Resume Performance',
      form: {
        content: [
          'resume performance of its obligations under this ',
          {use: 'Agreement'}, ', or'
        ]
      }
    });
    var second = Immutable.fromJS({
      heading: 'Conditions Precedent',
      form: {
        content: [
          'satisfy the conditions precedent to the ',
          {use: 'Performing Party'}, '\'s obligations,'
        ]
      }
    });
    var example = Immutable.fromJS({
      content: [
        'When the ', {use: 'Nonperforming Party'}, 'is able to',
        first, second, ' it shall immediately give the ',
        {use: 'Performing Party'}, 'written notice to that effect ' +
        'and shall resume performance under this ', {use: 'Agreement'},
        ' no later than two working days after the notice is delivered.'
      ]
    });

    it('validates a real-world example', function() {
      expect(validation.nestedForm(example))
        .to.be.true();
    });
  });
});

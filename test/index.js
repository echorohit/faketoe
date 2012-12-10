// Load modules

var Chai = require('chai');
var Fs = require('fs');
var Faketoe = process.env.TEST_COV ? require('../lib-cov') : require('../lib');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Chai.expect;


describe('XML', function () {

    describe('#createParser', function () {

        it('should parse arrays with object members', function (done) {

            var parser = Faketoe.createParser(function (err, result) {

                expect(err).to.not.exist;
                expect(result.item.child.length).to.equal(2);
                expect(result.item.child[0].child.length).to.equal(2);
                expect(result.item.child[0].child[1].name).to.equal('4');
                done();
            });

            Fs.createReadStream(__dirname + '/test1.xml').pipe(parser);
        });
    });
});


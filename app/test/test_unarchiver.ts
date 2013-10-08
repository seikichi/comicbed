import Unarchiver = require('utils/unarchiver');

var assert = chai.assert;

describe('PdfImageUnarchiver', () => {
  it('can extract Image XObject from pdf files', (done) => {
    var factory = Unarchiver.createFactory();
    factory.getUnarchiverFromURL('http://localhost:7357/2857/tmp/yuyushiki04.pdf')
      .then((unarchiver: Unarchiver.Unarchiver) => {
        var filename = unarchiver.filenames()[0];
        return unarchiver.unpack(filename);
      }).then((content: Unarchiver.Content) => {
        // document.body.appendChild(content);
        done();
      });
    assert.strictEqual(2, 1+1);
  });
});



